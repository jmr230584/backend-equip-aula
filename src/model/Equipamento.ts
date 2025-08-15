import { DatabaseModel } from "./DatabaseModel.js";

const dataBase = new DatabaseModel().pool;

export class Equipamento{
    private idEquipamento: number = 0;
    private nome: string;
    private categoria: string;
    private status: string;

    public constructor (_nome: string, _categoria: string, _status: string){
        this.nome = _nome;
        this.categoria = _categoria;
        this.status = _status;
    }

    public getIdEquipamento(): number{
        return this.idEquipamento;
    }

    public setIdEquipamento(_idEquipamento: number){
        this.idEquipamento = _idEquipamento;
    }

    public getNomeEquipamento(): string{
        return this.nome;
    }

    public setNomeEquipamento(_nome: string){
        this.nome = _nome;
    }

    public getCategoria(): string {
        return this.categoria;
    }

    public setCategoria(_categoria: string){
        this.categoria = _categoria;
    }

    public getStatus(): string{
        return this.status
    }

    public setStatus(_status: string){
        this.status = _status;
    }

    static async listarEquipamentos(): Promise<Array<Equipamento> | null>{

        let listaDeEquipamentos: Array<Equipamento> = [];

        try{

            const querySelectEquipamento = 'SELECT * FROM Equipamento;';
            const respostaBD = await dataBase.query(querySelectEquipamento);

            respostaBD.rows.forEach((equipamento: any)=> {
                let novoEquipamento = new Equipamento(
                    equipamento.nome,
                    equipamento.categoria,
                    equipamento.status
                );

                novoEquipamento.setIdEquipamento(equipamento.id_equipamento);
                listaDeEquipamentos.push(novoEquipamento);
            });

            return listaDeEquipamentos;

        } catch (error){

            console.log(`Erro ao acessar o modelo: ${error}`);
            return null;
            
        }

    }

    static async cadastrarEquipamento(equipamento: Equipamento): Promise<Boolean> {      
        
        try {
               
            const queryInsertEquipamento = `
                    INSERT INTO Equipamento (nome, categoria, status)
                    VALUES (
                        '${equipamento.getNomeEquipamento()}',
                        '${equipamento.getCategoria()}',
                        '${equipamento.getStatus()}'
                    )
                    RETURNING id_equipamento;`;    
                
            const result = await dataBase.query(queryInsertEquipamento);
    
            if (result.rows.length > 0) {
                    
                console.log(`Equipamento cadastrado com sucesso. ID: ${result.rows[0].id_equipamento}`);
                return true;
            }
    
            return false;
        
        } catch (error) {
            console.error(`Erro ao cadastrar equipamento: ${error}`);
            return false;
        }
    }
    
    
    static async removerEquipamento(idEquipamento: number): Promise<Boolean> {
            
        let queryResult = false;
        
        try {        
    
            const queryDeleteEquipamento = `DELETE FROM Equipamento WHERE id_equipamento=${idEquipamento};`;
        
            await dataBase.query(queryDeleteEquipamento)
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
    
    
    static async atualizarEquipamento(equipamento: Equipamento): Promise<Boolean> {
            
        let queryResult = false; 
        try {
            
            const queryAtualizaEquipamento = `UPDATE Equipamento SET 
                                            nome = '${equipamento.getNomeEquipamento()}', 
                                            categoria = '${equipamento.getCategoria()}',
                                            status = '${equipamento.getStatus()}'                                                                                    
                                        WHERE id_equipamento = ${equipamento.idEquipamento}`;
    
            await dataBase.query(queryAtualizaEquipamento)
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
