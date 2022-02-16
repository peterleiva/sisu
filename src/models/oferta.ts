import { model, type HydratedDocument, Schema, Types } from "mongoose";
import { CursoModel } from "./curso";
import { ModalidadeModel } from "./modalidade";

export interface Oferta {
  /**
   * Ano do processo seletivo
   */
  ano?: number;
  /**
   * Número da edição do   processo seletivo no ano de referência
   */
  edicao?: number;
  /**
   * modalidade ofertada
   */
  modalidade?: Types.ObjectId;
  /**
   * referencia ao curso da oferta
   */
  curso?: Types.ObjectId;
  /**
   * Quantidade de vagas ofertadas naquela modalidade
   */
  vagas?: number;
  /**
   * Nota de corte da modalidade/curso conforme o resultado da chamada regular.
   * A nota de corte é sempre igual a nota do último candidato classificado na
   * última vaga ofertada para a modalidade/curso escolhida.
   */
  notaCorte?: number;
  /**
   * Quantidade de inscrições para a modalidade
   */
  inscricoes?: number;
  /**
   * Percentual de bônus definido para as ações afirmativas próprias das IES
   */
  percentualBonus?: number;
}

const schema = new Schema<Oferta>({
  ano: Number,
  edicao: Number,
  vagas: Number,
  notaCorte: Number,
  percentualBonus: Number,
  modalidade: {
    type: Types.ObjectId,
    ref: ModalidadeModel,
  },
  curso: {
    type: Types.ObjectId,
    ref: CursoModel,
  },
});

schema.index({ ano: -1, edicao: 1, modalidade: 1, curso: 1 });

export type OfertaDocument = HydratedDocument<Oferta>;

export const OfertaModel = model("Oferta", schema);
