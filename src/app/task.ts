import { Guid } from 'guid-typescript';
export class Task {
    tomorrow: boolean = false;
    description: string = '';
    completed: boolean = false;
    id: string = Guid.create().toString();
    getCopy(): Task{ 
        let result: Task = new Task(); 
        result.tomorrow = this.tomorrow; 
        result.description = this.description; 
        result.completed = this.completed; 
        result.id = Guid.create().toString(); 
        return result; 
    } 
}
