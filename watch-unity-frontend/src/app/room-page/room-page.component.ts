import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { VideoSyncComponent } from "../video-sync/video-sync.component";
import { FormsModule } from '@angular/forms';
import { ChatComponent } from '../components/chat/chat.component';
import { CommonModule } from '@angular/common';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-room-page',
  imports: [HeaderComponent, VideoSyncComponent,FormsModule,ChatComponent],
  templateUrl: './room-page.component.html',
  styleUrl: './room-page.component.scss'
})
export class RoomPageComponent {
  userName:string | null='' ;
  currentVideoUrl="";
  roomId:string | null=''
  joinerName:string | null ='';

  router = inject(Router);

  ngOnInit(): void {
    
    this.userName =  localStorage.getItem('adminName');
    this.joinerName = localStorage.getItem('joinerName');
    this.roomId = localStorage.getItem('roomId');

    if( this.roomId == null || this.roomId == '') this.router.navigate(['/']);

    // if((this.userName == null || this.userName == '' && this.roomId == null || this.roomId == '' ) &&
    //     ((this.joinerName == null || this.joinerName == '') && (this.roomId == null || this.roomId == ''))
    // ){
    //   this.router.navigate(['/']);
    // }
    
  }

  onVideoUrlChange(url:string){
    console.log(url);
    this.currentVideoUrl = url;
  }


}
