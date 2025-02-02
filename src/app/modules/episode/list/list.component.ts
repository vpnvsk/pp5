import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EpisodeService } from '@core/http';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { CharactersDialogComponent } from '@shared/components/characters-dialog/characters-dialog.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  constructor(
    private episodeService: EpisodeService,
    public dialog: MatDialog
  ) {}

  displayedColumns = ['id', 'episode', 'name', 'air_date', 'characters'];

  episodes = null;
  loading = false;
  pageEvent: PageEvent;
  request = {};

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit(): void {
    this.loadTable();
  }

  loadTable(): void {
    this.loading = true;
    this.episodes = null;
    this.episodeService
      .episodes(this.request, this.pageEvent)
      .pipe(finalize(() => (this.loading = false)))
      .pipe(untilDestroyed(this))
      .subscribe((response) => {
        this.episodes = response;
        this.loading = false;
      });
  }

  characters(episode): void {
    this.dialog.open(CharactersDialogComponent, {
      data: {
        characters: episode.characters,
        title: `${episode.episode} Characters`,
      },
    });
  }

  applyFilter(event: Event): void {
    this.request = event;
    if (this.pageEvent) {
      this.paginator.firstPage();
    }
    this.loadTable();
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }
}
