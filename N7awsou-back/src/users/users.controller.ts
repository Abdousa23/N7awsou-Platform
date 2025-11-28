import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { createUserDto } from './DTO/create-user.dto';
import { updateUserDto } from './DTO/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { AtGuard } from 'src/common/guards';
import { GetCurrentUser, Public } from 'src/common/decorators';



@Controller('users')
export class UsersController {

    constructor(private readonly userService : UsersService){}
    /*
    POST /users
    PATCH /users:id
    DELETE /users:id
     */
    @Public()
    @Get()//GET /users
    findAll(@Query('role') role : 'TOURIST' | 'GUIDE' | 'ADMIN'){
        return this.userService.findAll(role)
    }

    @Get('profile')
    findOne(@GetCurrentUser('sub') id :number){
        return this.userService.findOne(id)
    }


    @Patch()
    update(@GetCurrentUser('sub') id:number, @Body(ValidationPipe) user : updateUserDto){
        return this.userService.update(id , user)
    }

    @UseGuards(AtGuard)
    @Delete(':id')
    delete(@Param("id" , ParseIntPipe) id : number){
        return this.userService.delete(id)
    }

}
