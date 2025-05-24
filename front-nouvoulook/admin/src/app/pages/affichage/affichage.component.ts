import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatisticsService } from '../../services/statistics.service';

@Component({
  selector: 'app-affichage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="statistics-container">
      <h2>Statistiques de visiteurs</h2>
      
      <div class="cards-row">
        <div class="stat-card orange">
          <span class="stat-label">Aujourd'hui</span>
          <span class="stat-value">{{ dailyViews }}</span>
        </div>
        <div class="stat-card blue">
          <span class="stat-label">Cette semaine</span>
          <span class="stat-value">{{ weeklyViews }}</span>
        </div>
        <div class="stat-card green">
          <span class="stat-label">Ce mois</span>
          <span class="stat-value">{{ monthlyViews }}</span>
        </div>
        <div class="stat-card purple">
          <span class="stat-label">Cette année</span>
          <span class="stat-value">{{ yearlyViews }}</span>
        </div>
      </div>

      <div class="widgets-row">
        <div class="widget big">
          <h3>Total des visiteurs</h3>
          <div class="widget-circles">
            <div class="circle-stat">
              <span class="circle-value">{{ totalViews }}</span>
              <span class="circle-label">Visites totales</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .statistics-container {
      padding: 1rem;
    }

    .cards-row {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .stat-card {
      flex: 1;
      min-width: 200px;
      background: #fff;
      border-radius: 1rem;
      box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.10);
      padding: 1.2rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .stat-card .stat-label {
      font-size: 0.95rem;
      color: #888;
      margin-bottom: 0.5rem;
    }

    .stat-card .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .stat-card.orange { border-top: 4px solid #ffa14e; }
    .stat-card.blue { border-top: 4px solid #7ed6df; }
    .stat-card.green { border-top: 4px solid #55efc4; }
    .stat-card.purple { border-top: 4px solid #a29bfe; }

    .widgets-row {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .widget {
      flex: 1;
      background: #fff;
      border-radius: 1rem;
      box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.10);
      padding: 1.5rem 1.2rem;
      min-width: 220px;
    }

    .widget.big {
      min-width: 300px;
    }

    .widget h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #555;
      margin-bottom: 1.2rem;
    }

    .widget-circles {
      display: flex;
      gap: 2rem;
      width: 100%;
      justify-content: space-around;
    }

    .circle-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .circle-value {
      font-size: 2rem;
      font-weight: 700;
      color: #ffa14e;
      margin-bottom: 0.3rem;
    }

    .circle-label {
      color: #888;
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .cards-row {
        flex-direction: column;
      }
      
      .stat-card {
        width: 100%;
      }
    }
  `]
})
export class AffichageComponent implements OnInit {
  totalViews = 0;
  dailyViews = 0;
  weeklyViews = 0;
  monthlyViews = 0;
  yearlyViews = 0;

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.statisticsService.getTotalViews().subscribe({
      next: (views) => this.totalViews = views,
      error: (error) => console.error('Erreur lors de la récupération des vues totales:', error)
    });

    this.statisticsService.getDailyViews().subscribe({
      next: (views) => this.dailyViews = views,
      error: (error) => console.error('Erreur lors de la récupération des vues quotidiennes:', error)
    });

    this.statisticsService.getWeeklyViews().subscribe({
      next: (views) => this.weeklyViews = views,
      error: (error) => console.error('Erreur lors de la récupération des vues hebdomadaires:', error)
    });

    this.statisticsService.getMonthlyViews().subscribe({
      next: (views) => this.monthlyViews = views,
      error: (error) => console.error('Erreur lors de la récupération des vues mensuelles:', error)
    });

    this.statisticsService.getYearlyViews().subscribe({
      next: (views) => this.yearlyViews = views,
      error: (error) => console.error('Erreur lors de la récupération des vues annuelles:', error)
    });
  }
} 