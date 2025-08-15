import { DatabaseModel } from "./DatabaseModel.js";

const dataBase = new DatabaseModel().pool;

export class Emprestimo{

    private idEmprestimo: number = 0;
    private idUsuario: number;
    private idEquipamento: number;
    private dataEmprestimo: Date;
    private dataPrevistaDevolucao: Date;
    private dataRealDevolucao?: Date;
    private status: string;

    public constructor (_idUsuario: number, _idEquipamento: number, 
        _dataEmprestimo: Date = new Date(), _dataPrevistaDevolucao: Date = new Date(), 
        _status: string){
            this.idUsuario = _idUsuario,
            this.idEquipamento = _idEquipamento,
            this.dataEmprestimo = _dataEmprestimo,
            this.dataPrevistaDevolucao = _dataPrevistaDevolucao,
            this.status = _status
    }

    public getEmprestimo(): number{
        return this.idEmprestimo;
    }

    public setIdEmprestimo(_idEmprestimo: number): void{
        this.idEmprestimo = _idEmprestimo;
    }

    public getIdUsuario(): number{
        return this.idUsuario;
    }

    public setIdUsuario(_idUsuario: number): void{
        this.idUsuario = _idUsuario;
    }

    public getIdEquipamento(): number{
        return this.idEquipamento;
    }

    public setIdEquipamento(_idEquipamento: number): void{
        this.idEquipamento = _idEquipamento;
    }

    public getDataDeEmprestimo(): Date{
        return this.dataEmprestimo;
    }

    public setDataDeEmprestimo(_dataEmprestimo: Date): void{
        this.dataEmprestimo = _dataEmprestimo;
    }

    public getDataPrevistaDevolucao(): Date{
        return this.dataPrevistaDevolucao;
    }

    public setDataPrevistaDevolucao(_dataPrevistaDevolucao: Date): void{
        this.dataPrevistaDevolucao = _dataPrevistaDevolucao;
    }

    public getDataRealDevolucao(): Date | undefined{
        return this.dataRealDevolucao;
    }

    public setDataRealDevolucao(_dataRealDevolucao: Date): void{
        this.dataRealDevolucao = _dataRealDevolucao;
    }

     public getStatus(): string {
        return this.status;
    }

    public setStatus(_status: string): void{
        this.status = _status;
    }

    static async listarEmprestimos(): Promise<any[] | null>{
    
        try {
            const querySelectEmprestimo = `
            SELECT 
            e.id_emprestimo, 
            e.data_emprestimo, 
            e.data_prevista_devolucao, 
            e.data_real_devolucao, 
            e.status AS status_emprestimo, 
            u.id_usuario, 
            u.nome AS nome_usuario, 
            u.tipo_usuario, 
            u.contato, 
            eq.id_equipamento, 
            eq.nome AS nome_equipamento, 
            eq.categoria, 
            eq.status AS status_equipamento 
            FROM emprestimo e
            JOIN usuario u ON e.id_usuario = u.id_usuario
            JOIN equipamento eq ON e.id_equipamento = eq.id_equipamento;
            `;

            const respostaBD = await dataBase.query(querySelectEmprestimo);

            const emprestimos = respostaBD.rows.map((linha: any) => ({
                idEmprestimo: linha.id_emprestimo,
                dataEmprestimo: linha.data_emprestimo,
                dataPrevistaDevolucao: linha.data_prevista_devolucao,
                dataRealDevolucao: linha.data_real_devolucao,
                status: linha.status,
                
                usuario: {
                    idUsuario: linha.id_usuario,
                    nome: linha.nome_usuario,
                    tipoUsuario: linha.tipo_usuario
                    },

                equipamento: {
                    idEquipamento: linha.id_equipamento,
                    nome: linha.nome_equipamento,
                    categoria: linha.categoria
                }
            }));

            return emprestimos;

        } catch (error) {
            console.log(`Erro ao acessar o modelo: ${error}`);
            return null;
        }
    }

    static async listarEmprestimosDetalhados(): Promise<any[] | null> {
        try {
            const query = 'SELECT * FROM emprestimos_detalhados;';
            const respostaBD = await dataBase.query(query);

            // estrutura do JSON
            const emprestimos = respostaBD.rows.map((linha: any) => ({
                idEmprestimo: linha.id_emprestimo,
                dataEmprestimo: linha.data_emprestimo,
                dataPrevistaDevolucao: linha.data_prevista_devolucao,
                dataRealDevolucao: linha.data_real_devolucao,
                status: linha.status,
                estaEmAtraso: linha.esta_em_atraso,

                usuario: {
                    idUsuario: linha.id_usuario,
                    nome: linha.nome_usuario,
                    tipoUsuario: linha.tipo_usuario
                    },

                equipamento: {
                    idEquipamento: linha.id_equipamento,
                    nome: linha.nome_equipamento,
                    categoria: linha.categoria
                }
            }));
            
            return emprestimos;

        } catch (error) {
             console.error('Erro ao consultar a view emprestimos_detalhados:', error);
             return null;
        }
    }

    static async cadastrarEmprestimo(emprestimo: Emprestimo): Promise<Boolean> {      
            
        try {                   
            const queryInsertEmprestimo = `
                        INSERT INTO Emprestimo (id_usuario, id_equipamento, data_emprestimo,
                            data_prevista_devolucao, status)
                                VALUES (
                                    ${emprestimo.getIdUsuario()},
                                    ${emprestimo.getIdEquipamento()},
                                    '${emprestimo.getDataDeEmprestimo().toISOString()}',
                                    '${emprestimo.getDataPrevistaDevolucao().toISOString()}',
                                    '${emprestimo.getStatus()}'
                        )
                        RETURNING id_emprestimo;`;    
                    
            const result = await dataBase.query(queryInsertEmprestimo);
        
            if (result.rows.length > 0) {

                //const idEmprestimo =  result.rows[0].id_emprestimo;                       
                console.log(`Emprestimo cadastrado com sucesso. ID: ${result.rows[0].id_emprestimo}`);
                return true;
            }
        
            return false;
            
        } catch (error) {
            console.error(`Erro ao cadastrar emprestimo: ${error}`);
            return false;
        }
    }

    static async atualizarEmprestimo(emprestimo: Emprestimo): Promise<Boolean> {
                
        let queryResult = false; 
        try {
                
            const queryAtualizaEmprestimo = `UPDATE Emprestimo SET 
                                                id_usuario = ${emprestimo.getIdUsuario()}, 
                                                id_equipamento = ${emprestimo.getIdEquipamento()},
                                                data_emprestimo = '${emprestimo.getDataDeEmprestimo().toISOString()}',
                                                data_prevista_devolucao = '${emprestimo.getDataPrevistaDevolucao().toISOString()}',
                                                status = '${emprestimo.getStatus()}'                                                                                   
                                            WHERE id_emprestimo = ${emprestimo.idEmprestimo}`;
        
            await dataBase.query(queryAtualizaEmprestimo)
                    .then((result) => {
                        if (result.rowCount != 0) {
                            queryResult = true; 
                        }
            });    
                   
            return queryResult;
    
        } catch (error) {
            console.log(`Erro na consulta: ${error}`);
            return queryResult;
        }
    }

}