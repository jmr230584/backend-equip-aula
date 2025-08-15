import { Equipamento } from "../model/Equipamento.js";
import type { Request, Response } from "express";


interface EquipamentoDTO {
    nome: string;
    categoria: string;
    status: string
}

class EquipamentoController extends Equipamento {

    static async todos(req: Request, res: Response): Promise<any> {
        try {
            const listaDeEquipamentos = await Equipamento.listarEquipamentos();
            
            return res.status(200).json(listaDeEquipamentos);

        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);

           return res.status(400).json("Erro ao recuperar as informações do Equipamento");
        }
    }

    static async cadastrar(req: Request, res: Response) : Promise<any>  {
        try {
            
            const dadosRecebidos: EquipamentoDTO = req.body;
            
            const novoEquipamento = new Equipamento(
                dadosRecebidos.nome,
                dadosRecebidos.categoria,
                dadosRecebidos.status              
            );
            
            const result = await Equipamento.cadastrarEquipamento(novoEquipamento);

            if (result) {
                return res.status(200).json(`Equipamento cadastrado com sucesso`);
            } else {
                return res.status(400).json('Não foi possível cadastrar o equipamento no banco de dados');
            }
        } catch (error) {
            console.log(`Erro ao cadastrar o equipamento: ${error}`);
            return res.status(400).json('Erro ao cadastrar o equipamento');
        }
    }

    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idEquipamento = parseInt(req.query.idEquipamento as string);
            const result = await Equipamento.removerEquipamento(idEquipamento);
            
            if (result) {
                return res.status(200).json('Equipamento removido com sucesso');
            } else {
                return res.status(401).json('Erro ao deletar equipamento');
            }
        } catch (error) {
            console.log("Erro ao remover o Equipamento");
            console.log(error);
            return res.status(500).send("error");
        }
    }

    static async atualizar(req: Request, res: Response): Promise<any> {
        try {
            
            const dadosRecebidos: EquipamentoDTO= req.body;
                        
            const equipamento = new Equipamento(
                dadosRecebidos.nome,
                dadosRecebidos.categoria,
                dadosRecebidos.status             
            );

            equipamento.setIdEquipamento(parseInt(req.query.idEquipamento as string));

            if (await Equipamento.atualizarEquipamento(equipamento)) {
                return res.status(200).json({ mensagem: "Cadastro atualizado com sucesso!" });
            } else {
                return res.status(400).json('Não foi possível atualizar o equipamento no banco de dados');
            }
        } catch (error) {
            
            console.error(`Erro no modelo: ${error}`);            
            return res.json({ mensagem: "Erro ao atualizar equipamento." });
        }
    }
}

export default EquipamentoController;