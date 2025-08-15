import { Emprestimo } from "../model/Emprestimo.js";
import type { Request, Response } from "express";

interface EmprestimoDTO {
    idUsuario: number;
    idEquipamento: number;
    dataEmprestimo: Date; 
    dataPrevistaDevolucao: Date;
    dataRealDevolucao?: Date;
    status: 'ativo' | 'concluido' | 'atrasado';

  usuario: {    
    nome: string;
    tipo: 'aluno' | 'professor';
    contato: string;
  };

  equipamento: {    
    nome: string;
    categoria: string;
    status: 'disponivel' | 'emprestado' | 'manutencao';
  };
}


class EmprestimoController extends Emprestimo {

    static async todos(req: Request, res: Response): Promise<any> {
        try {
            const listaDeEmprestimos = await Emprestimo.listarEmprestimos();
            
            return res.status(200).json(listaDeEmprestimos);

        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);

           return res.status(400).json("Erro ao recuperar as informações do Equipamento");
        }
    }

    static async listarDetalhados(req: Request, res: Response): Promise<any> {

        try {
            const emprestimos = await Emprestimo.listarEmprestimosDetalhados();
            if (!emprestimos || emprestimos.length === 0) {
                return res.status(204).send(); 
            }

            return res.status(200).json(emprestimos);

        } catch (error) {
            console.error('Erro ao retornar empréstimos detalhados:', error);
            return res.status(500).json({ erro: 'Erro ao retornar os empréstimos detalhados.' });
        }
    }

    static async cadastrar(req: Request, res: Response) : Promise<any>  {
        try {
            const dadosRecebidos: EmprestimoDTO = req.body;
            const novoEmprestimo = new Emprestimo(
                dadosRecebidos.idUsuario,
                dadosRecebidos.idEquipamento,
                new Date(dadosRecebidos.dataEmprestimo),
                new Date (dadosRecebidos.dataPrevistaDevolucao),
                dadosRecebidos.status                            
            );

            //const idEmprestimo = await Emprestimo.cadastrarEmprestimo(novoEmprestimo);
            const result = await Emprestimo.cadastrarEmprestimo(novoEmprestimo);

            /*
           if (idEmprestimo !== null) {
                return res.status(201).json({
                mensagem: 'Empréstimo cadastrado com sucesso!',
                idEmprestimo: idEmprestimo
            });
            */
            if (result) {
                return res.status(200).json(`Emprestimo cadastrado com sucesso`);
            } else {
                return res.status(400).json('Não foi possível cadastrar o Emprestimo no banco de dados');
            }
        } catch (error) {
            console.log(`Erro ao cadastrar o emprestimo: ${error}`);
            return res.status(400).json('Erro ao cadastrar o emprestimo');
        }
    }

    static async atualizar(req: Request, res: Response): Promise<any> {

        try {                
            const dadosRecebidos: EmprestimoDTO = req.body;
                            
            const atualizandoEmprestimo = new Emprestimo(
                dadosRecebidos.idUsuario,
                dadosRecebidos.idEquipamento,
                new Date(dadosRecebidos.dataEmprestimo),
                new Date (dadosRecebidos.dataPrevistaDevolucao),
                dadosRecebidos.status                            
            );
    
            atualizandoEmprestimo.setIdEmprestimo(parseInt(req.query.idEmprestimo as string));
                   
            if (await Emprestimo.atualizarEmprestimo(atualizandoEmprestimo)) {
                return res.status(200).json({ mensagem: "Cadastro atualizado com sucesso!" });
            } else {
                return res.status(400).json('Não foi possível atualizar o emprestimo no banco de dados');
            }

        } catch (error) {                
            console.error(`Erro no modelo: ${error}`);            
            return res.json({ mensagem: "Erro ao atualizar emprestimo." });
        }
    }
}

export default EmprestimoController; 