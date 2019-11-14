---
title: Quick-Start
metadata:
    description: These are the options to get CSYCMS - (We see only one option for now. If you'd like to go any other way of installing, then you'll have to go it alone).
    keywords: csycms, file-based content management system, knowledge base, static site generator, nodejs
    author: Brian Onang'o
---


# QuickStart

These are the options to get CSYCMS: (We see only one option for now. If you'd like to go any other way of installing, then you'll have to go it alone).

### Just Testing 

If you'd like to just test csycms, then there is no need to install the whole system. Just follow these steps. (Please jump to the next section to see how to install csycms as a service for production environments)

```
git clone git@github.com:csymapp/csycms.git
```

or you are new to github or to ssh, then you may have a hard time with the previous command. In that case you can use:

```
git clone https://github.com/csymapp/csycms.git
```

Then copy the configuration files

```
cd csycms
cp .env.example .env
```

csycms is now all set up. You now need to create your first site. To do this just use the command line script provided.

```
./src/csycms-manage.sh create-site
```

That will create a copy of csycms test site and update the `.env` file and the `system.config.js` file for you. You can fine tune the settings yourself according to the instructions given after setting up the site.

For further information on how to use the script, you can check out the [documentation](https://learn.csycms.csymapp.com)


then run your site using the command


```
SITE={yoursitename} PORT={porttorunsitein} node bin/app.js
```

or you can equally just use the script again

```
./src/csycms-manage.sh run-site {yoursitename}
```

### From GitHub

We have created an [installation script](https://github.com/csymapp/csycms/blob/master/Install/installCsycms.sh) which you can use to install CSYCMS. 

```
cd /tmp
wget https://raw.githubusercontent.com/csymapp/csycms/master/Install/installCsycms.sh
chmod +x installCsycms.sh
./installCsycms.sh
```

Then follow the installation instructions as directed by the script.

You will have to edit [some configurations](/csycms/Configuration)

If you do not modify the contents of `.env` manually (we recommend that you do not do that unless you know what you are doing), then you will have some sites created by default. You can list these by:

```
./src/csycms-manage.sh list-sites
```

That should give you a list of the existing sites (with their names). Then you can remove individual sites by:

```
./src/csycms-manage.sh remove-site
```

You will be prompted for the name of the site to remove. You can repeat this process until you have removed all sites, then you can add your own new site using:

```
./src/csycms-manage.sh create-site
```

You can then either run your new site using

```
./src/csycms-manage.sh run-site {yoursitename}
```

Or restart the service to have the service run the site for you:

```
systemctl restart csycms
```