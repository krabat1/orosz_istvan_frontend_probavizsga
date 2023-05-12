import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Task } from '../task';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HomeComponent implements OnInit {

  tasks: Array<Task> = new Array<Task>();
  actualTask: Task = new Task();
  today: string = '';
  tomorrow: string = '';
  modalText: string = '';
  tasksForToday: Array<Task> = new Array<Task>();
  tasksForTomorrow: Array<Task> = new Array<Task>();
  checked: { [key: string]: boolean; } = {};
  originalTask: string = '';

  constructor(private cdr: ChangeDetectorRef) { } 

  ngOnInit(): void {
    let today = new Date();
    let timestamp = today.getTime()
    let tomorrow = new Date( timestamp + (1000*60*60*24) );
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    console.log('Dátumok beállítása')
    console.log('Input focus, hogy ne kelljen kattintgatni.')
    this.today = today.toLocaleDateString(undefined, options);
    this.tomorrow = tomorrow.toLocaleDateString(undefined, options);
    // ha van már feladat elmetve a mentés localStorage-ban, töltsük be
    this.import();
    this.cdr.markForCheck();
  }

  clearConsole(){
    console.clear();
    this.cdr.detectChanges(); // *trigger change here*
  }

  // ha változik a nap-kiválasztás vagy a szöveg,
  //írjuk ki konzolra az actualTaskot ellenőrzésképpen
  onKey(e: Event){
    //this.checkDiag();
  }
  checkDiag(){
    //console.log(this.actualTask);
  }

  // feladat hozzáadása
  save(){
    if(this.actualTask.description != ''){
      let copy: Task = this.actualTask.getCopy();
      console.log('Ezt az objektet pusholjuk a feladatok tömbjébe:');
      copy.description = this.sanitize(copy.description)
      console.log(copy);
      this.tasks.push(copy);
      this.actualTask = new Task();
      this.export();
    }else{
      //alert('Write something in the input field, please!')
      this.openModal('Write something in the input field, please!')
    }
  }

  openModal(modalText: string) {
    this.modalText = modalText;
    let modal = document.getElementById("exampleModal") as HTMLElement
    modal.style.display = "block"
    modal.classList.add("show")
  }
  closeModal() {
    let modal = document.getElementById("exampleModal") as HTMLElement
    modal.style.display = "none"
    modal.classList.remove("show")
  }

  // mentés localStorage-ba
  export(){
    console.log('A feladatok tömbjét eltároljuk a localStorage-ba.')
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.import();
  }

  // betöltés localStorage-ból
  import(){
    console.log('import')
    // betöltjük az adatokat a localStorage-ból
    this.tasks = JSON.parse(localStorage.getItem('tasks') as string);
    if( this.tasks != null && this.tasks.length > 0 ){
      this.tasksForToday = this.tasks.filter(val => val.tomorrow == false);
      this.tasksForTomorrow = this.tasks.filter(val => val.tomorrow == true);
      console.log('Betöltjük a mentett adatokat és szétválogatjuk a mai és holnapi teendőket:')
      console.log(this.tasksForToday)
      console.log(this.tasksForTomorrow)
      //https://stackoverflow.com/a/43064411/4279940

      if( this.tasksForToday.length != 0 ){
        this.tasksForToday.forEach(element => {
          this.checked[element.id] = false;
        });
      }
      if( this.tasksForTomorrow.length != 0 ){
        this.tasksForTomorrow.forEach(element => {
          this.checked[element.id] = false;
        });
      }
      this.cdr.detectChanges(); // *trigger change here* https://stackoverflow.com/a/56311756/4279940
    }
    // ha nincs mit betölteni
    if( this.tasks == null || this.tasks.length == 0 ){
      console.log('Nincs betöltendő feladat.')
    }
  }

  // szerkesztésre kattintás
  prevFocus(e: Event, id: string){ 
    console.log('Szerkeszthetővé tesszük a '+id+' id-jű feladatot')
    let label = document.querySelector('label[for="'+id+'"]') as HTMLElement
    let checkbox = document.querySelector('input[id="'+id+'"]') as HTMLElement
    this.checked[id]=false;
    label.setAttribute('contenteditable','true')
    label.focus() 
    this.originalTask = label.innerText;
  }
  // szerkesztés vége
  onFocusOutEvent(e: Event, id: string){
    //console.log(id)
    let label = e.target as HTMLElement
    let modifiedTask = label.innerText;
    //console.log(modifiedTask)
    label.removeAttribute('contenteditable')
    const lettersRegexp = /^[A-Za-z0-9öüóőúéáűíÖÜÓŐÚÉÁŰÍ]+$/;
    if( this.originalTask == modifiedTask ) {
      //do nothing
      console.log('A szöveg nem változott')
    }else if( lettersRegexp.test(modifiedTask) === false ){
      console.log('A kapott szöveg nem tartalmaz betűket')
      this.openModal('If you don\'t write anything, nothing will change.')
      this.updateTask(id,this.originalTask)
    }else{
      this.updateTask(id,modifiedTask) 
    }
  }

  sanitize(str:string){
    str = str.replace(/(?:\r\n|\r|\n)/g, ' ');
    return str.trim()
  }

  //update
  updateTask(id: string, text: string){
    console.log('Update-eljük a feladatot a feladatok tömbjében')
    this.tasks.forEach(element => {
      if(element.id == id){
        element.description = this.sanitize(text);
        console.log(element) 
        this.export()  
      }
    });
  }


  switchDay(when: string){
    let switchIds = [];
    let switchTasks: NodeListOf<Element> = document.querySelectorAll('div#' + when + ' input[type="checkbox"]:checked');
    for(let i=0; i < switchTasks.length; i++){
      switchIds[i]= switchTasks.item(i).id
    }
    if( switchIds.length > 0 ){
      console.log('A következő id-jű feladatoknál állítjuk át a napot:')
      console.log(switchIds)
    }else{
      this.openModal('You have not selected any tasks for the given day: "'+when+'".')
      console.log('A felhasználó rossz gombot nyomott meg az áthelyezéshez')
    }
    switchIds.forEach(element => {
      this.tasks.forEach((elem, index) => {
        if(elem.id == element){
          this.tasks[index].tomorrow = !this.tasks[index].tomorrow
          this.checked[elem.id]=false;
        }
      });
    });
    this.export();
  }

  //feladatok törlése
  delete(){
    let deleteIds = [];
    // https://stackoverflow.com/a/37553027/4279940
    let deleTasks: NodeListOf<Element> = document.querySelectorAll('div#today input[type="checkbox"]:checked, div#tomorrow input[type="checkbox"]:checked')
    for(let i=0; i < deleTasks.length; i++){
      deleteIds[i]= deleTasks.item(i).id
    }
    console.log('A következő id-jű feladatokat töröltük a feladatok tömbjéből:')
    console.log(deleteIds)
    deleteIds.forEach(element => {
      this.tasks.forEach((elem, index) => {
        if(elem.id == element){
          delete this.checked[elem.id]
          this.tasks.splice(index, 1);
        }
      });
      //console.log(this.checked)
      //console.log(this.tasks)
      // lehetséges hiba: ha az alábbi feltétel nincs, az utolsó feladat törlését nem rendereli újra valamiért 
      if(this.tasks.length == 0){
        //minden kiírt adatot törlünk
        let today = document.querySelector('div#today') as HTMLElement
        let tomorrow = document.querySelector('div#tomorrow') as HTMLElement
        today.innerHTML = "";
        today.innerHTML = "";
        today.innerHTML = "<div class=\"text-center \">| <strong>no task</strong> |</div>";
        tomorrow.innerHTML = "<div class=\"text-center \">| <strong>no task</strong> |</div>";
      }
    });
    this.export();
  }

}
