import { Injectable, Logger } from "@nestjs/common";
import { TableRepository } from '../../domain/repositories/table.repository';
import { TableEntity } from "@domain/entities";
import { TableTypeormEntity } from '../entities/table.typeorm.entity';

@Injectable()
export class TableMysqlRepository implements TableRepository {
    private readonly logger: Logger = new Logger(TableMysqlRepository.name);
    
    constructor(private readonly tableTypeormEntity : TableTypeormEntity) {}

    async findAll(): Promise<TableEntity[]> {
        // Implementation for fetching all tables from MySQL database
        return [];
    }

    async findById(id: number): Promise<TableEntity> {
        // Implementation for fetching a table by ID from MySQL database
        return new TableEntity({ id, name: 'Sample Table' });
    }
}