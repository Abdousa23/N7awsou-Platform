import { CreateTourDto } from "./create-tour.dto";
import {PartialType} from "@nestjs/mapped-types"

export class UpdateTourDto extends PartialType(CreateTourDto){}