import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <main class="app-shell">
      <h1>Steam Inventory Dashboard</h1>
      <p>The Angular frontend is ready to connect to the Express portfolio API.</p>
    </main>
  `,
  styles: [
    `
      .app-shell {
        padding: 2rem;
        font-family: sans-serif;
      }
    `,
  ],
})
export class App {
}
