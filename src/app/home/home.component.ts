import { Component, OnInit } from '@angular/core';
import { Task } from '../task';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  tasks: Array<Task> = new Array<Task>();
  actualTask: Task = new Task();
  today: string = '';
  tomorrow: string = '';
  modalText: string = '';

  constructor() { }

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
  }

  // ha változik a kiválasztás vagy a szöveg,
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
    console.log('A feladatok tömbjét eltárojuk a localStorage-ba.')
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
    this.import();
  }

  // betöltés localStorage-ból
  import(){
    //minden kiírt adatot törlünk
    let today = document.querySelector('div#today') as HTMLElement
    let tomorrow = document.querySelector('div#tomorrow') as HTMLElement
    today.innerHTML = "";
    tomorrow.innerHTML = "";
    // betöltjük az adatokat a localStorage-ból
    this.tasks = JSON.parse(localStorage.getItem('tasks') as string);
    //console.log(this.tasks);
    if( this.tasks != null && this.tasks.length > 0 ){
      let tasksForToday = this.tasks.filter(val => val.tomorrow == false);
      let tasksForTomorrow = this.tasks.filter(val => val.tomorrow == true);
      console.log('Betöltjük a mentett adatokat és szétválogatjuk a mai és holnapi teendőket:')
      console.log(tasksForToday)
      console.log(tasksForTomorrow)
      if( tasksForToday.length != 0 ){
        tasksForToday.forEach(element => {
          today.innerHTML += '<span class="d-inline-flex w-100 px-2 rounded"><input type="checkbox" id="'+element.id+'" name="'+element.id+'"><label class="ps-1" for="'+element.id+'" contenteditable="true">'+element.description+'</label></span>'
        });
      }else{
        today.innerHTML = "<div class=\"text-center \">| <strong>no task</strong> |</div>";
      }
      if( tasksForTomorrow.length != 0 ){
        tasksForTomorrow.forEach(element => {
          tomorrow.innerHTML += '<span class="d-inline-flex w-100 px-2 rounded"><input type="checkbox" id="'+element.id+'" name="'+element.id+'"><label class="ps-1" for="'+element.id+'" contenteditable="true">'+element.description+'</label></span>'
        });
      }else{
        tomorrow.innerHTML = "<div class=\"text-center \">| <strong>no task</strong> |</div>";
      }
      //console.log(this.tasks);
    }
    // ha nincs mit betölteni
    if( this.tasks == null || this.tasks.length == 0 ){
      console.log('Nincs betöltendő feladat.')
      this.tasks = new Array<Task>();
      today.innerHTML = "<div class=\"text-center \">| <strong>no task</strong> |</div>";
      tomorrow.innerHTML = "<div class=\"text-center \">| <strong>no task</strong> |</div>";
    }
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
        }
      });
    });
    this.export();
    //mint a deleténél, 
    //de itt csak a tomorrow-t választjuk ki és megfordítjuk a booleant
    //aztán export
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
          this.tasks.splice(index, 1);
          //console.log(index)
        }
      });
    });
    this.export();
  }

}
