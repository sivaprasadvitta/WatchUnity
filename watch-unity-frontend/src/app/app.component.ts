import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoSyncComponent } from "./video-sync/video-sync.component";
import { HeaderComponent } from "./components/header/header.component";
import { RoomPageComponent } from "./room-page/room-page.component";

@Component({
  selector: 'app-root',
  imports: [RoomPageComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'watch-unity-frontend';
}
