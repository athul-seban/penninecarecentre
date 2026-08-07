Commit and push current changes to GitHub (master branch).

1. Run `git status` and `git diff --stat` to summarise what has changed.
2. If there are no changes, tell the user and stop.
3. Show the user a one-line summary of the changes and ask them to confirm or provide a commit message. If $ARGUMENTS is non-empty, use that as the commit message directly (skip the confirmation).
4. Stage all modified/new files that belong to the project (avoid .env, node_modules, dist/).
5. Commit with the message, appending `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`.
6. Push to `origin master`.
7. Print the GitHub URL: https://github.com/athul-seban/penninecarecentre
