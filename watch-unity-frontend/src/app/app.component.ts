import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoSyncComponent } from "./video-sync/video-sync.component";
import { HeaderComponent } from "./components/header/header.component";
import { RoomPageComponent } from "./room-page/room-page.component";
import { HomeComponent } from "./pages/home/home.component";

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'watch-unity-frontend';
}
