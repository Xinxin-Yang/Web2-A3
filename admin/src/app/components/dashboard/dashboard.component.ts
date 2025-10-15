import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div style="padding: 20px;">
      <h1>🎉 Charity Events Admin Dashboard</h1>
      <p>Welcome to the Charity Events Administration Panel</p>
      <div style="margin-top: 20px;">
        <h3>Quick Links:</h3>
        <ul>
          <li>Manage Events</li>
          <li>View Registrations</li>
          <li>Create New Events</li>
        </ul>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent { }