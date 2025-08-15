import { Usuario } from "../model/Usuario.js";
import type { Request, Response } from "express";

/**
 * Interface UsuarioDTO
 * Define os atributos que devem ser recebidos do usuario nas requisições
 */
interface UsuarioDTO {
    nome: string;
    tipoUsuario: string;
    contato: string
}

/**
 * Controlador para operações relacionadas aos usuarios.
 */
class UsuarioController extends Usuario {

    static async todos(req: Request, res: Response): Promise<any> {
        
        try {
            const listaDeUsuarios = await Usuario.listarUsuarios();
            
            return res.status(200).json(listaDeUsuarios);

        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);

           return res.status(400).json("Erro ao recuperar as informações do Usuário");
        }
    } 
    
    static async cadastrar(req: Request, res: Response) : Promise<any>  {
        try {
            // Desestruturando objeto recebido pelo front-end
            const dadosRecebidos: UsuarioDTO = req.body;
                               
            // Instanciando objeto Usuario
            const novoUsuario = new Usuario(
                dadosRecebidos.nome,
                dadosRecebidos.tipoUsuario,
                dadosRecebidos.contato              
            );

            // Chama o método para persistir o usuário no banco de dados
            const result = await Usuario.cadastrarUsuario(novoUsuario);

            // Verifica se a query foi executada com sucesso
            if (result) {
                return res.status(200).json(`Usuário cadastrado com sucesso`);
            } else {
                return res.status(400).json('Não foi possível cadastrar o usuário no banco de dados');
            }
        } catch (error) {
            console.log(`Erro ao cadastrar o usuário: ${error}`);
            return res.status(400).json('Erro ao cadastrar o usuário');
        }
    }

    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            const idUsuario = parseInt(req.query.idUsuario as string);
            const result = await Usuario.removerUsuario(idUsuario);
            
            if (result) {
                return res.status(200).json('Usuário removido com sucesso');
            } else {
                return res.status(401).json('Erro ao deletar usuário');
            }
        } catch (error) {
            console.log("Erro ao remover o Usuário");
            console.log(error);
            return res.status(500).send("error");
        }
    }

    static async atualizar(req: Request, res: Response): Promise<any> {
        try {
            // Desestruturando objeto recebido pelo front-end
            const dadosRecebidos: UsuarioDTO= req.body;
                        
            // Instanciando objeto Usuário
            const usuario = new Usuario(
                dadosRecebidos.nome,
                dadosRecebidos.tipoUsuario,
                dadosRecebidos.contato              
            );

            // Define o ID do usuario, que deve ser passado na query string
            usuario.setIdUsuario(parseInt(req.query.idUsuario as string));

            // Chama o método para atualizar o cadastro do aluno no banco de dados
            if (await Usuario.atualizarUsuario(usuario)) {
                return res.status(200).json({ mensagem: "Cadastro atualizado com sucesso!" });
            } else {
                return res.status(400).json('Não foi possível atualizar o usuário no banco de dados');
            }
        } catch (error) {
            // Caso ocorra algum erro, este é registrado nos logs do servidor
            console.error(`Erro no modelo: ${error}`);
            // Retorna uma resposta com uma mensagem de erro
            return res.json({ mensagem: "Erro ao atualizar usuário." });
        }
    }

    static async unico (req: Request, res: Response): Promise<any> {

        try {
            /*
            const idParam = (req.params.id ?? req.query.idUsuario) as string;
            const idUsuario = Number(idParam);*/
            const idUsuario = parseInt(req.query.idUsuario as string);

            if (!idUsuario || Number.isNaN(idUsuario)) {
                return res.status(400).json
                ({ mensagem: "Parâmetro idUsuario inválido ou ausente." });
            }

            const usuario = await Usuario.buscarPorId(idUsuario);
            console.log(usuario);

            if (!usuario) {
                return res.status(404).json
                ({ mensagem: "Usuário não encontrado." });
            }

            return res.status(200).json(usuario);

        } catch (error) {
            console.error(`Erro ao buscar usuário: ${error}`);
            return res.status(500).json
            ({ mensagem: "Erro ao buscar usuário." });
        }
    }
    
}

export default UsuarioController;