import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { signal } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('ECAdminClient');

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Load saved theme on app startup
    this.themeService.loadTheme();
  }
}
