import {Injectable} from '@nestjs/common';
import {CreateConfigDto} from './dto/create-config.dto';
import {UpdateConfigDto} from './dto/update-config.dto';
import {PrismaService} from "../prisma/prisma.service";

@Injectable()
export class ConfigsService {

    constructor(private readonly prisma: PrismaService) {
    }

    create(createConfigDto: CreateConfigDto) {
        return 'This action adds a new config';
    }

    configuration(configSelected:number ,listId: number[]) {
        console.log('payload', configSelected,listId);

        // recuperer tous les ip serveur de la liste d'id
        // Venir ecrire dans le fichier de config ansible les ip a configurer ainsi que les mot de passe de chaque serveur et identifiant root
        // Executer le script de lancement de la config
        // Trouver un moyen si possible de suivre cette evenement et une fois l'operation terminé renvoyer au front une alert, web socket ? en tous cas pouvoir laisser l'operation en tache de font, et qu'on puisse la suivre dans une petite fenetre de navigation
        // Une fois l'operation terminé et valide, recuperation du mot de passe de la configqui sera le meme pour tousse (plus simple) et update de tous ces serveur pour les passer en configured ainsi que tous les autre elements necessaire
        return {message: "ok"}
    }

    findAll() {
        return this.prisma.ansibleConfig.findMany();
    }

    findOne(id: number) {
        return `This action returns a #${id} config`;
    }

    update(id: number, updateConfigDto: UpdateConfigDto) {
        return `This action updates a #${id} config`;
    }

    remove(id: number) {
        return `This action removes a #${id} config`;
    }
}
