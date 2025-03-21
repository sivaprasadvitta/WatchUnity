import { Component } from '@angular/core';
import { HeaderComponent } from '../components/header/header.component';
import { VideoSyncComponent } from "../video-sync/video-sync.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-page',
  imports: [HeaderComponent, VideoSyncComponent,FormsModule],
  templateUrl: './room-page.component.html',
  styleUrl: './room-page.component.scss'
})
export class RoomPageComponent {
  userName:string='siva';
  currentVideoUrl="";
  
  

  onVideoUrlChange(url:string){
    console.log(url);
    this.currentVideoUrl = url;
  }


}
