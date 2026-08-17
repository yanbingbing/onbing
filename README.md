# onbing

Static personal blog for `onbing.com`.

## Structure

```text
index.html                         Home page and post list
blog/*.html                        One static HTML file per post
assets/site.css                    Shared site styles
assets/posts/<slug>/               Post-specific images
feed.xml                           RSS feed
sitemap.xml                        Search engine sitemap
robots.txt                         Crawler policy
```

## Add a post

1. Add `blog/<slug>.html`.
2. Put its images under `assets/posts/<slug>/`.
3. Add the post to `index.html`, `feed.xml`, and `sitemap.xml`.
4. Use an absolute canonical URL under `https://onbing.com/`.

## Deploy to Vercel

Import this repository as a Vercel project with Framework Preset set to `Other`.
No build command or output directory is required. Add `onbing.com` in the Vercel Domains settings and configure DNS using the records Vercel provides.
