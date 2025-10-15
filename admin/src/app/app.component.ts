import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <nav class="navbar">
        <div class="nav-container">
          <div class="nav-brand">
            <h1>❤️ Charity Events Admin</h1>
          </div>
          <div class="nav-menu">
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
              📊 Dashboard
            </a>
          </div>
        </div>
      </nav>
      
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Charity Events Admin';
}