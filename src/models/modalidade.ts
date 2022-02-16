import { HydratedDocument, model, Schema } from "mongoose";

export interface Modalidade {
  /**
   * Tipo da modalidade da oferta do curso no processo seletivo
   */
  tipo?: string;
  /**
   * Descrição do tipo da modalidade de concorrência ofertada para o curso no
   * processo seletivo
   */
  descricao?: string;
}

const schema = new Schema<Modalidade>({
  tipo: String,
  descricao: String,
});

export type ModalidadeDocument = HydratedDocument<Modalidade>;

export const ModalidadeModel = model("Modalidade", schema);
