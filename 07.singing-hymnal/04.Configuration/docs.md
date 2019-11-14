---
title: Configuration
metadata:
    description: You will need to do a bit of configuration before you can successfully use CSYCMS. You will need to edit the `.env` file and a `system.config.js` file for each site defined in `.env`. Each of these files have examples with the required parameters. You can check `.env.example` whose contents are copied to `.env` upon installation. And `system.config.example` which is copied for each new site registered.
    author: Brian Onang'o
---


# Configuration


You will need to do a bit of configuration before you can successfully use CSYCMS. You will need to edit the `.env` file and a `system.config.js` file for each site defined in `.env`. Each of these files have examples with the required parameters. You can check `.env.example` whose contents are copied to `.env` upon installation. And `system.config.example` which is copied for each new site registered.

## .env

`
    SITES="csycms|3000|https://github.com/csymapp/csycms-learn.git" # list of sites
`

`SITES` is a comma separated list of sites.

An entry for a single site has in order:
- site name
- port on which to server it
- the repo in which the site files are found

These parameters are separated by a `|`. To add another site, create for it its own configuration line. And add the line to `SITES=`, separating it from the last line by a comma.

`CSYCMSDOCSREPO=https://github.com/csymapp/csycms-learn.git # repo where csycms documentation is.`

You may not have to do anything to this.

`THEMESREPO=git@github.com:csymapp/csycms-themes.git # repo where csycms themes are`

Please leave also this as it is, unless you know what you are doing.

`UPDATEINTERVAL=5 # update interval in minutes`

The period for which you'd like the system to check for update for itself and for all the sites.

You can change these values while setting up the system for the first time or at any other time. Just remember to `systemctl restart csycms.service` every time you make any changes to `.env` except for the changes made during the installation.


## system.config.js

You will also need to make changes to all `system.config.js` in `config/*`. Please be sure especially to change 
 - `domain` (it is just a wrong naming which we will change later). By domain we mean the base url without the protocol. eg `www.cseco.co.ke`, `localhost:3001`, etc
 - `site`. This should be the same as the site name given in `.env`
 - `site_space`. This is used to defined sites whose content can be searched together.
 - `site_title`. 
 - `search_scope`. The value for this is either `local` or `global`. It defines where only the content for the current site is searched during a search performed on the site or the content for all the sites in the `search_space`.

For detailed documentation please refer to [csycms docs](http://learn.csycms.csymapp.com) or [csycms docs on github](https://github.com/csymapp/csycms-learn)