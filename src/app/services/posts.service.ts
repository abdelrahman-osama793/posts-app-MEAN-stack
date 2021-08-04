import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { Post } from '../models/post.model';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PostsService {
  constructor(private http: HttpClient, private router: Router) {}

  private posts: Post[] = [];
  private postsSubject = new Subject<{ posts: Post[]; totalPosts: number }>();

  private postsURL = 'http://localhost:6060/api/posts';

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ posts: any; totalPosts: number }>(this.postsURL + queryParams)
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map(
              (post: {
                title: any;
                content: any;
                _id: any;
                imagePath: any;
                creator: any;
              }) => {
                return {
                  title: post.title,
                  content: post.content,
                  id: post._id,
                  imagePath: post.imagePath,
                  creator: post.creator,
                };
              }
            ),
            totalPosts: postData.totalPosts,
          };
        })
      )
      .subscribe((postFinalForm) => {
        this.posts = postFinalForm.posts;
        this.postsSubject.next({
          posts: [...this.posts],
          totalPosts: postFinalForm.totalPosts,
        });
      });
  }

  getPostsStream() {
    return this.postsSubject.asObservable();
  }

  getPost(postId: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(`${this.postsURL}/${postId}`);
  }

  addPosts(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(this.postsURL, postData)
      .subscribe((response) => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete(`${this.postsURL}/${postId}`);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;

    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: '',
      };
    }
    this.http.put(`${this.postsURL}/${id}`, postData).subscribe((response) => {
      this.router.navigate(['/']);
    });
  }
}
