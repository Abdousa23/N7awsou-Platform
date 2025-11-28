import { Injectable } from '@nestjs/common';
import { createUserDto } from './DTO/create-user.dto';
import { updateUserDto } from './DTO/update-user.dto';
import { NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {

    constructor(private readonly databaseService : DatabaseService){}

    findAll(role? : 'TOURIST' | 'GUIDE' | 'ADMIN'){
        return this.databaseService.user.findMany()
    }

    findOne(id:number){

        const foundUser = this.databaseService.user.findUnique({
            where : {
                id
            }
        })
        if (!foundUser) throw new NotFoundException("No user found with this is") 
        return foundUser
    }

/*      create(user : createUserDto){
        const userByhighestId = this.databaseService.user.sort((a,b)=>a.id-b.id)
        const newUser = {
            id: userByhighestId[0].id +1,
            ...user
        }
        this.users.push(newUser)
        return newUser
    }  */

    update(id : number,updatedUser : updateUserDto){

        return this.databaseService.user.update({
            where : {
                id
            },
            data : {
                ...updatedUser

            }

        })
    }

    delete(id : number){
        this.databaseService.user.delete({
            where : {
                id
            }
        })
    }

    }
