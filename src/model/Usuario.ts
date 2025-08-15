import { DatabaseModel } from "./DatabaseModel.js";

// Recupera conexão com o banco de dados
const dataBase = new DatabaseModel().pool;

/**
 * Classe que representa o usuário do sistema
 */
export class Usuario {
    private idUsuario: number = 0; // Identificador único do aluno
    private nome: string; 
    private tipoUsuario: string; 
    private contato: string; 

    public constructor (_nome:string, _tipoUsuario: string, _contato: string ){
        this.nome = _nome;
        this.tipoUsuario = _tipoUsuario;
        this.contato = _contato;        
    }
    
    public getIdUsuario(): number{
        return this.idUsuario;
    }

    public setIdUsuario(_idUsuario: number): void{
        this.idUsuario = _idUsuario;
    }

    
    public getNome() {  
        return this.nome;
    }

    public setNome(_nome: string){  
        this.nome = _nome;
    }

    public setTipoUsuario(_tipoUsuario: string){  
        this.tipoUsuario = _tipoUsuario;
    }

    public getTipoUsuario() {
        return this.tipoUsuario;
    }

    public setContato(_contato: string) {
        this.contato = _contato;
    }

    public getContato() {
        return this.contato;
    }

    // MÉTODO PARA ACESSAR O BANCO DE DADOS
    // CRUD Create - READ - Update - Delete

    static async listarUsuarios(): Promise<Array<Usuario> | null> {
        // Criando lista vazia para armazenar os alunos
        let listaDeUsuarios: Array<Usuario> = [];

        try {
            // Query para consulta no banco de dados
            const querySelectUsuario = `SELECT * FROM Usuario;`;

            // executa a query no banco de dados
            const respostaBD = await dataBase.query(querySelectUsuario);    

            // percorre cada resultado retornado pelo banco de dados
            // usuario é o apelido que demos para cada linha retornada do banco de dados
            respostaBD.rows.forEach((usuario: any) => {
                
                // criando objeto usuario
                let novoUsuario = new Usuario(
                    usuario.nome,
                    usuario.tipo_usuario,
                    usuario.contato
                );
                // adicionando o ID ao objeto
                novoUsuario.setIdUsuario(usuario.id_usuario);
                
                // adicionando o usuario a lista
                listaDeUsuarios.push(novoUsuario);
            });

            // retornado a lista de usuarios para quem chamou a função
            return listaDeUsuarios;
        } catch (error) {
            console.log(`Erro ao acessar o modelo: ${error}`);
            return null;
        }
    }

    static async cadastrarUsuario(usuario: Usuario): Promise<Boolean> {      
        try {
            // Cria a consulta (query) para inserir o registro de um usuario no banco de dados, retorna o ID do usuario criado 
            const queryInsertUsuario = `
                INSERT INTO Usuario (nome, tipo_usuario, contato)
                VALUES (
                    '${usuario.getNome()}',
                    '${usuario.getTipoUsuario()}',
                    '${usuario.getContato()}'
                )
                RETURNING id_usuario;`;

            // Executa a query no banco de dados e armazena o resultado
            const result = await dataBase.query(queryInsertUsuario);

            // verifica se a quantidade de linhas que foram alteradas é maior que 0
            if (result.rows.length > 0) {
                // Exibe a mensagem de sucesso
                console.log(`Usuario cadastrado com sucesso. ID: ${result.rows[0].id_usuario}`);
                // retorna verdadeiro
                return true;
            }

            // caso a consulta não tenha tido sucesso, retorna falso
            return false;
        // captura erro
        } catch (error) {
            // Exibe mensagem com detalhes do erro no console
            console.error(`Erro ao cadastrar usuario: ${error}`);
            // retorna falso
            return false;
        }
    }


    static async removerUsuario(idUsuario: number): Promise<Boolean> {
        // variável para controle de resultado da consulta (query)
        let queryResult = false;
    
        try {        

            // Construção da query SQL para deletar o Aluno.
            const queryDeleteUsuario = `DELETE FROM Usuario WHERE id_usuario=${idUsuario};`;
    
            // Executa a query de exclusão e verifica se a operação foi bem-sucedida.
            await dataBase.query(queryDeleteUsuario)
            .then((result) => {
                if (result.rowCount != 0) {
                    queryResult = true; // Se a operação foi bem-sucedida, define queryResult como true.
                }
            });
    
            // retorna o resultado da query
            return queryResult;

        // captura qualquer erro que aconteça
        } catch (error) {
            // Em caso de erro na consulta, exibe o erro no console e retorna false.
            console.log(`Erro na consulta: ${error}`);
            // retorna false
            return queryResult;
        }
    }


    static async atualizarUsuario(usuario: Usuario): Promise<Boolean> {
        // Variável para armazenar o resultado da operação.
        let queryResult = false; 
        try {
            // Construção da query SQL para atualizar os dados do usuario.
            const queryAtualizaUsuario = `UPDATE Usuario SET 
                                            nome = '${usuario.getNome()}', 
                                            tipo_usuario = '${usuario.getTipoUsuario()}',
                                            contato = '${usuario.getContato()}'                                                                                    
                                        WHERE id_usuario = ${usuario.idUsuario}`;

            // Executa a query de atualização e verifica se a operação foi bem-sucedida.
            await dataBase.query(queryAtualizaUsuario)
            .then((result) => {
                if (result.rowCount != 0) {
                    queryResult = true; // Se a operação foi bem-sucedida, define queryResult como true.
                }
            });

            // Retorna o resultado da operação para quem chamou a função.
            return queryResult;
        } catch (error) {
            // Em caso de erro na consulta, exibe o erro no console e retorna false.
            console.log(`Erro na consulta: ${error}`);
            return queryResult;
        }
    }

    static async buscarPorId(idUsuario: number): Promise<any | null> {

        try {

            const queryBuscarPorId = `SELECT id_usuario, nome, tipo_usuario, contato
            FROM usuario WHERE id_usuario = $1;`;

            const { rows } = await dataBase.query(queryBuscarPorId, [idUsuario]);
            if (rows.length === 0) return null;
            const usuarioBD = rows[0];

            return {
                idUsuario: usuarioBD.id_usuario,
                nome: usuarioBD.nome,
                tipoUsuario: usuarioBD.tipo_usuario,
                contato: usuarioBD.contato
            };

        } catch (error) {
            console.error(`Erro ao buscar usuario por ID: ${error}`);
            return null;
        }
    }

}