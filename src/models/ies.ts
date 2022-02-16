import { HydratedDocument, model, Schema, Types } from "mongoose";
import { CursoModel } from "./curso";

/**
 * Instituto de ensino superior
 */
interface IES {
  /**
   * Código da instituição de ensino superior confome informações do cadastro
   * e-MEC
   */
  codigo?: string;
  /**
   * Nome da instituição de ensino superior confome informações do cadastro
   * e-MEC
   */
  nome?: string;
  /**
   * Sigla da instituição de ensino superior confome informações do cadastro
   * e-MEC
   */
  sigla?: string;
  /**
   * Descrição da organização acadêmica da instituição de ensino superior
   * confome informações do cadastro e-MEC
   */
  organizacao?: string;
  /**
   * Descrição da categoria administrativa da instituição de ensino superior
   * confome informações do cadastro e-MEC
   */
  categoriaAdmin?: string;
  /**
   * cursos oferecido pela instituição de ensino
   */
  cursos: Types.ObjectId[];
}

export const schema = new Schema<IES>({
  codigo: { type: String, unique: true },
  nome: String,
  sigla: String,
  organizacao: String,
  categoriaAdmin: String,
  cursos: [
    {
      type: Types.ObjectId,
      ref: CursoModel,
    },
  ],
});

export type IESDocument = HydratedDocument<IES>;

export const IESModel = model("IES", schema);
