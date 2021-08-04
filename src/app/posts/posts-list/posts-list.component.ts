import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

import { Post } from '../../models/post.model';
import { PostsService } from '../../services/posts.service';

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss'],
})
export class PostsListComponent implements OnInit, OnDestroy {
  postsList: Post[] = [];
  isLoading: boolean = false;
  currentPage = 1;
  totalPosts = 0;
  postsPerPage = 5;
  userId!: string;
  pageSizeOptions = [1, 2, 5, 10, 15];
  isUserAuthenticated = false;

  private postsSubscription!: Subscription;
  private authListenerSubscription!: Subscription;

  constructor(
    public postsService: PostsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    /*
    Subscribe() takes 3 args 
    1- executes whenever a new dat is emitted
    2- executes whenever an error is emitted
    3- executes when the observable is completed, whenever there are no more values to be expected
    */
    this.postsSubscription = this.postsService
      .getPostsStream()
      .subscribe((postData: { posts: Post[]; totalPosts: number }) => {
        this.isLoading = false;
        this.postsList = postData.posts;
        this.totalPosts = postData.totalPosts;
      });
    this.isUserAuthenticated = this.authService.getIsAuthenticated();
    this.authListenerSubscription = this.authService
      .getAuthListener()
      .subscribe((isAuth) => {
        this.isUserAuthenticated = isAuth;
        this.userId = this.authService.getUserId();
      });
  }

  onDelete(postID: string) {
    this.postsService.deletePost(postID).subscribe(() => {
      this.isLoading = true;
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }

  onChangePage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1; //Starts with zero
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSubscription.unsubscribe();
    this.authListenerSubscription.unsubscribe();
  }
}
