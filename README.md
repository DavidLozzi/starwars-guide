# starwars-guide using Jekyll on Netlify

[![Netlify Status](https://api.netlify.com/api/v1/badges/0a8dd93e-19c6-40be-8740-608c8e70377f/deploy-status)](https://app.netlify.com/projects/starwars-guide-lozzi/deploys)

update GemFile and install

`bundle install`

Update lock file for GitHub actions

`bundle lock --add-platform x86_64-linux`

Run locally

`npm start`

Will run

  `bundle exec jekyll serve`

  and open in a browser

Mimic GitHub Actions build

`bundle exec jekyll build`
