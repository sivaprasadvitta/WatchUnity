import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PopComponent } from './components/pop/pop.component';
import { RoomPageComponent } from './room-page/room-page.component';
import { UploadComponent } from './pages/upload/upload.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'pop/:task', component: PopComponent },
    { path: 'room/:id', component: RoomPageComponent },
    { path: 'upload', component: UploadComponent }
];
