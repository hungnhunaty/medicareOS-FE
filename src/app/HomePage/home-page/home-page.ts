import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from "@angular/router";
import { Header } from "../../header/header";
import { Footer } from "../../footer/footer";

@Component({
  selector: 'app-home-page',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  constructor(public router: Router){

  }

}
