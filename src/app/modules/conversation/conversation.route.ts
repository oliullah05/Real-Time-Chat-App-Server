import express from "express"
import { ConversationControllers } from "./conversation.controller";
import validateRequest from "../../middlewars/validateRequest";
import { ConversationValidations } from "./conversation.validation";
import auth from "../../middlewars/auth";
const router = express.Router();


router.post("/create-or-update-conversation-then-sliently-create-message", auth("user","admin"),
validateRequest(ConversationValidations.createConversation), 
ConversationControllers.createOrUpdateConversationThenSlientlyCreateMessage);

router.post("/create-group-conversation-then-sliently-create-message", auth("user","admin"),
validateRequest(ConversationValidations.createConversation), 
ConversationControllers.createGroupConversationThenSlientlyCreateMessage);


router.post("/updateConversationThenSlientlyCreateMessage", auth("user","admin"),
validateRequest(ConversationValidations.updateConversationThenSlientlyCreateMessage), 
ConversationControllers.updateConversationThenSlientlyCreateMessage);


router.get("/my-conversations", auth("user","admin"),
ConversationControllers.getMyConversations);

router.get("/conversationById/:id", auth("user","admin"),
ConversationControllers.getConversationById);

router.get("/conversationByParticipants", auth("user","admin"),
ConversationControllers.getConversationByParticipants);

router.put("/updateConversationByParticipants", auth("user","admin"),validateRequest(ConversationValidations.updateConversation),
ConversationControllers.updateConversationByParticipants);



export const ConversationRoutes = router;