import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { signal } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { Loader } from './shared/loader/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader],
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
