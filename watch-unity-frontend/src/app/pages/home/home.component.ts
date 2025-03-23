import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  constructor(private router: Router) {}

  // onCreateRoom(create: string) {

  //   this.router.navigate([`/pop/${create}`]);
  // }
  
  // onJoinRoom(join: string) {
  //   this.router.navigate([`/pop/${join}`]);
  // }
  

  

}
