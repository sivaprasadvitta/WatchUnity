import { Component, inject, SimpleChanges } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { VideoSyncComponent } from "../video-sync/video-sync.component";
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '../components/chat/chat.component';
import { CommonModule } from '@angular/common';
import {  ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-room-page',
  imports: [HeaderComponent, VideoSyncComponent,FormsModule,ChatComponent],
  templateUrl: './room-page.component.html',
  styleUrl: './room-page.component.css'
})
export class RoomPageComponent {
  userName:string | null='' ;
  currentVideoUrl="";
  roomId:string | null=''
  joinerName:string | null ='';

  router = inject(Router);
  // route = inject(ActivatedRoute);
  id:string = '';

  constructor(private route:ActivatedRoute){
    
    
  }
  // ngOnChanges(changes: SimpleChanges): void {
  //   //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
  //   //Add '${implements OnChanges}' to the class.
    
    
  // }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && changes['id'].currentValue !== changes['id'].previousValue) {
      this.id = changes['id'].currentValue;
    }
  }

  ngOnInit(): void {
    
    this.userName =  localStorage.getItem('adminName');
    this.joinerName = localStorage.getItem('joinerName');
    this.roomId = localStorage.getItem('roomId');

    if( this.roomId == null || this.roomId == '') this.router.navigate(['/']);

    setTimeout(()=>{
      this.route.paramMap.subscribe(params => {
        this.id = params.get('id') || '';
      });
    },3000)
    
  }
  onRemoveId(){
    this.id='';
  }

  onVideoUrlChange(url:string){
    // console.log(url);
    this.currentVideoUrl = url;
  }

  ngOnDestroy(): void {

    localStorage.removeItem('adminName');
    localStorage.removeItem('joinerName');
    localStorage.removeItem('roomId');
    localStorage.removeItem('isHost');
  }


}
