import express from "express";
import { SERVER_ROUTES } from "./appConfig.js";
import UsuarioController from "./controller/UsuarioController.js";

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ mensagem: "Rota padrão" })
});

router.get(SERVER_ROUTES.LISTAR_USUARIO, UsuarioController.todos);
router.get(SERVER_ROUTES.UNICO_USUARIO, UsuarioController.unico);
router.post(SERVER_ROUTES.NOVO_USUARIO, UsuarioController.cadastrar);
router.delete(SERVER_ROUTES.REMOVER_USUARIO, UsuarioController.remover);
router.put(SERVER_ROUTES.ATUALIZAR_USUARIO, UsuarioController.atualizar);

export { router }