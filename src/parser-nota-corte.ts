import { Transform, Writable } from "stream";
import { CursoDocument, CursoModel } from "./models/curso";
import { withTransaction } from "./database";
import { parse } from "csv-parse";
import {
  IESDocument,
  IESModel,
  ModalidadeDocument,
  ModalidadeModel,
  OfertaDocument,
  OfertaModel,
} from "./models";
import { createReadStream } from "fs";

type Record = string[];
type RecordObj = ReturnType<typeof csvLine>;
type Progress = (progress: { current: number; total: number }) => void;

type Chunk = {
  record: RecordObj;
};

const csvLine = (record: string[]) => {
  const [
    NU_ANO,
    NU_EDICAO,
    CO_IES,
    NO_IES,
    SG_IES,
    DS_ORGANIZACAO_ACADEMICA,
    DS_CATEGORIA_ADM,
    NO_CAMPUS,
    NO_MUNICIPIO_CAMPUS,
    SG_UF_CAMPUS,
    DS_REGIAO_CAMPUS,
    CO_IES_CURSO,
    NO_CURSO,
    DS_GRAU,
    DS_TURNO,
    TP_MODALIDADE,
    DS_MOD_CONCORRENCIA,
    NU_PERCENTUAL_BONUS,
    QT_VAGAS_CONCORRENCIA,
    NU_NOTACORTE,
    QT_INSCRICAO,
  ] = record;

  return {
    NU_ANO,
    NU_EDICAO,
    CO_IES,
    NO_IES,
    SG_IES,
    DS_ORGANIZACAO_ACADEMICA,
    DS_CATEGORIA_ADM,
    NO_CAMPUS,
    NO_MUNICIPIO_CAMPUS,
    SG_UF_CAMPUS,
    DS_REGIAO_CAMPUS,
    CO_IES_CURSO,
    NO_CURSO,
    DS_GRAU,
    DS_TURNO,
    TP_MODALIDADE,
    DS_MOD_CONCORRENCIA,
    NU_PERCENTUAL_BONUS,
    QT_VAGAS_CONCORRENCIA,
    NU_NOTACORTE,
    QT_INSCRICAO,
  };
};

const parseNumber = (num: string): number | null =>
  Number.parseFloat(num.replace(",", ".")) || null;

const parseRecord = new Transform({
  writableObjectMode: true,
  readableObjectMode: true,
  transform(record: Record, encoding, next) {
    const result = csvLine(record);
    next(null, { record: result });
  },
});

async function createCurso({
  CO_IES_CURSO,
  NO_CURSO,
  DS_GRAU,
  NO_CAMPUS,
  NO_MUNICIPIO_CAMPUS,
  SG_UF_CAMPUS,
  DS_REGIAO_CAMPUS,
  DS_TURNO,
}: RecordObj): Promise<CursoDocument> {
  const doc = await CursoModel.findOne({ codigo: CO_IES_CURSO });
  const curso =
    doc ??
    new CursoModel({
      codigo: CO_IES_CURSO,
      nome: NO_CURSO,
      grau: DS_GRAU,
      turno: DS_TURNO,
      campus: {
        nome: NO_CAMPUS,
        municipio: NO_MUNICIPIO_CAMPUS,
        uf: SG_UF_CAMPUS,
        regiao: DS_REGIAO_CAMPUS,
      },
    });

  return curso;
}

async function createModalidade({
  TP_MODALIDADE,
  DS_MOD_CONCORRENCIA,
}: RecordObj): Promise<ModalidadeDocument> {
  const doc = await ModalidadeModel.findOne({ tipo: TP_MODALIDADE });

  const modalidade =
    doc ??
    new ModalidadeModel({
      tipo: TP_MODALIDADE,
      descricao: DS_MOD_CONCORRENCIA,
    });

  return modalidade;
}

async function createOferta(
  {
    NU_ANO,
    NU_EDICAO,
    QT_VAGAS_CONCORRENCIA,
    NU_NOTACORTE,
    QT_INSCRICAO,
    NU_PERCENTUAL_BONUS,
  }: RecordObj,
  curso: CursoDocument,
  modalidade: ModalidadeDocument
): Promise<OfertaDocument> {
  const doc = await OfertaModel.findOne({
    ano: NU_ANO,
    edicao: NU_EDICAO,
    modalidade: modalidade._id,
    curso: curso._id,
  });

  const oferta =
    doc ??
    new OfertaModel({
      ano: parseNumber(NU_ANO),
      edicao: parseNumber(NU_EDICAO),
      vagas: parseNumber(QT_VAGAS_CONCORRENCIA),
      notaCorte: parseNumber(NU_NOTACORTE),
      inscricoes: parseNumber(QT_INSCRICAO),
      percentualBonus: parseNumber(NU_PERCENTUAL_BONUS),
      curso,
      modalidade,
    });

  return oferta;
}

async function createIES(
  {
    CO_IES,
    SG_IES,
    DS_ORGANIZACAO_ACADEMICA,
    DS_CATEGORIA_ADM,
    NO_IES,
  }: RecordObj,
  curso: CursoDocument
): Promise<IESDocument> {
  const doc = await IESModel.findOne({ codigo: CO_IES });
  const ies =
    doc ??
    new IESModel({
      codigo: CO_IES,
      nome: NO_IES,
      sigla: SG_IES,
      organizacao: DS_ORGANIZACAO_ACADEMICA,
      categoriaAdmin: DS_CATEGORIA_ADM,
    });

  if (!ies.cursos.includes(curso._id)) ies.cursos.push(curso._id);

  return ies;
}

let line = 1;

const save = new Writable({
  objectMode: true,

  write({ record }: Chunk, enc, next) {
    withTransaction(async (session) => {
      const modalidade = await createModalidade(record);
      const curso = await createCurso(record);
      const ies = await createIES(record, curso);
      const oferta = await createOferta(record, curso, modalidade);

      await curso.save({ session });
      await modalidade.save({ session });
      await ies.save({ session });
      await oferta.save({ session });
    })
      .then(() => {
        next(null);
      })
      .catch((error) => {
        console.error("\ncan't save line %d\n", line, error);
        next(null);
      })
      .finally(() => ++line);
  },
});

export default function createParser(csvFile: string, updater: Progress) {
  const file = createReadStream(csvFile);

  const csvParser = parse({
    delimiter: ";",
  });

  const progress = new Writable({
    objectMode: true,
    write(chunk, enc, next) {
      const { lines: total, records: current } = csvParser.info;
      updater({ current, total });

      next(null);
    },
  });

  csvParser.pipe(progress);

  const stream = file.pipe(csvParser).pipe(parseRecord).pipe(save);

  return stream;
}
