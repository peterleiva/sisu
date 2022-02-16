import {
  type HydratedDocument,
  type LeanDocument,
  model,
  Schema,
} from "mongoose";

export interface Curso {
  /**
   * Código do curso da instituição de ensino superior confome informações do
   * cadastro e-MEC
   */
  codigo?: string;
  /**
   * Nome do curso da instituição de ensino superior confome informações do
   * cadastro e-MEC
   */
  nome?: string;
  /**
   * Grau do curso da instituição de ensino superior confome informações do
   * cadastro e-MEC
   */
  grau?: string;
  /**
   * Turno do curso da instituição de ensino superior confome informações do
   * cadastro e-MEC
   */
  turno?: string;
  /**
   * campus na qual pertence o curso
   */
  campus?: Campus;
}

interface Campus {
  /**
   * Nome do campus da instituição de ensino superior confome informações do
   * cadastro e-MEC
   */
  nome?: string;
  /**
   * Nome do município do campus da instituição de ensino superior confome
   * informações do cadastro e-MEC
   */
  municipio?: string;
  /**
   * Sigla da unidade da federação (UF) na qual está localizada o campus da
   * instituição de ensino superior confome informações do cadastro e-MEC
   */
  uf?: string;
  /**
   * Descrição da região na qual está localizada o campus da instituição de
   * ensino superior confome informações do cadastro e-MEC
   */
  regiao?: string;
}

const campusSchema = new Schema<Campus>({
  nome: String,
  municipio: String,
  uf: String,
  regiao: String,
});

const cursoSchema = new Schema<Curso>({
  codigo: { type: String, unique: true },
  nome: { type: String, index: true },
  grau: String,
  turno: String,
  campus: {
    type: campusSchema,
  },
});

export type CampusDocument = LeanDocument<Campus>;
export type CursoDocument = HydratedDocument<Curso>;

export const CursoModel = model("Curso", cursoSchema);
