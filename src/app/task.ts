import { Guid } from 'guid-typescript';
export class Task {
    tomorrow: boolean = true;
    description: string = '';
    id: string = Guid.create().toString();
    getCopy(): Task{ 
        let result: Task = new Task(); 
        result.tomorrow = this.tomorrow; 
        result.description = this.description; 
        result.id = Guid.create().toString();
        //console.log(result); 
        return result; 
    } 
}
