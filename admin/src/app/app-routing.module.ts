import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EventListComponent } from './components/event-list/event-list.component';
import { EventFormComponent } from './components/event-form/event-form.component';
import { RegistrationListComponent } from './components/registration-list/registration-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/:id/edit', component: EventFormComponent },
  { path: 'events/:id/registrations', component: RegistrationListComponent },
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }