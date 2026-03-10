Last login: Tue Mar 10 11:04:34 2026 from 78.154.13.95
root@uxla0m4m:~# cd Digital-Literacy-Wellbeing-60-plus
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# uname -a && lsb_release -a && hostname -I && curl -s ifconfig.me
Linux uxla0m4m.superdnsserver.net 5.4.0-216-generic #236-Ubuntu SMP Fri Apr 11 19:53:21 UTC 2025 x86_64 x86_64 x86_64 GNU/Linux
No LSB modules are available.
Distributor ID: Ubuntu
Description:    Ubuntu 20.04.6 LTS
Release:        20.04
Codename:       focal
185.123.188.236 172.19.0.1 172.17.0.1 172.18.0.1
185.123.188.236root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# nginx -v 2>&1; apache2 -v 2>&1; which node && node -v
nginx version: nginx/1.18.0 (Ubuntu)


Command 'apache2' not found, but can be installed with:

apt install apache2-bin

root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# systemctl status nginx 2>/dev/null; systemctl status apache2 2>/dev/null
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
     Active: inactive (dead) since Wed 2025-10-01 19:47:12 EEST; 5 months 7 days ago
       Docs: man:nginx(8)
   Main PID: 877 (code=exited, status=0/SUCCESS)

Warning: journal has been rotated since unit was started, output may be incomplete.
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
NAMES                                         IMAGE                                       STATUS        PORTS
digital-literacy-wellbeing-60-plus-client-1   digital-literacy-wellbeing-60-plus-client   Up 6 hours    3000/tcp
digital-literacy-wellbeing-60-plus-server-1   digital-literacy-wellbeing-60-plus-server   Up 6 hours    8080/tcp
digital-literacy-wellbeing-60-plus-db-1       postgres:16                                 Up 6 hours    5432/tcp
nginx-proxy-manager-app-1                     jc21/nginx-proxy-manager:latest             Up 5 months   0.0.0.0:80-81->80-81/tcp, [::]:80-81->80-81/tcp, 0.0.0.0:443->443/tcp, [::]:443->443/tcp
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# docker network ls
NETWORK ID     NAME                                         DRIVER    SCOPE
560d8a4b168e   bridge                                       bridge    local
1f285df64890   digital-literacy-wellbeing-60-plus_default   bridge    local
a98587dac3ad   host                                         host      local
75860b257947   nginx-proxy                                  bridge    local
e59181d8479a   none                                         null      local
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# docker inspect $(docker ps -q) | grep -E '"Name"|"IPAddress"|"Ports"|"Image"'
        "Image": "sha256:0279af469b7948735c3929fc355e71de015abb77bfe5607e1ced6f8f07ec9103",
        "Name": "/digital-literacy-wellbeing-60-plus-client-1",
                "Name": "no",
                    "Name": "nofile",
            "Name": "overlay2"
            "Image": "digital-literacy-wellbeing-60-plus-client",
            "Ports": {
            "IPAddress": "",
                    "IPAddress": "172.18.0.4",
                    "IPAddress": "172.19.0.3",
        "Image": "sha256:30397327769471cb108227e06c1bb4b3c08141b0afe00d1cdc8700138ba462f3",
        "Name": "/digital-literacy-wellbeing-60-plus-server-1",
                "Name": "no",
            "Name": "overlay2"
            "Image": "digital-literacy-wellbeing-60-plus-server",
            "Ports": {
            "IPAddress": "",
                    "IPAddress": "172.18.0.3",
                    "IPAddress": "172.19.0.2",
        "Image": "sha256:b8c80b87c813a2ee26748ce49686844942f297bcc19b6cca3d49cd2fe0a87808",
        "Name": "/digital-literacy-wellbeing-60-plus-db-1",
                "Name": "no",
            "Name": "overlay2"
                "Name": "digital-literacy-wellbeing-60-plus_postgres_data",
            "Image": "postgres:16",
            "Ports": {
            "IPAddress": "",
                    "IPAddress": "172.18.0.2",
        "Image": "sha256:405c49a2d38c1c10fb4a99317d1a2b873b11732b62ad05079ce31566f0f553a1",
        "Name": "/nginx-proxy-manager-app-1",
                "Name": "unless-stopped",
            "Name": "overlay2"
            "Image": "jc21/nginx-proxy-manager:latest",
            "Ports": {
            "IPAddress": "",
                    "IPAddress": "172.19.0.4",
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# ^C
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# find / -name "docker-compose.yml" -o -name "docker-compose.yaml" 2>/dev/null
/var/lib/docker/overlay2/42ceb971bdbf2bed12c3cdce6dd4a332f5d3a0cf7770091700e44396457eb63e/diff/app/node_modules/knex/scripts/stress-test/docker-compose.yml
/var/lib/docker/overlay2/42ceb971bdbf2bed12c3cdce6dd4a332f5d3a0cf7770091700e44396457eb63e/diff/app/node_modules/knex/scripts/docker-compose.yml
/var/lib/docker/overlay2/019f87151f3cabee83640b94815d5158f6d7394d2a1586f688c176554d55c111/merged/app/node_modules/knex/scripts/stress-test/docker-compose.yml
/var/lib/docker/overlay2/019f87151f3cabee83640b94815d5158f6d7394d2a1586f688c176554d55c111/merged/app/node_modules/knex/scripts/docker-compose.yml
/root/Digital-Literacy-Wellbeing-60-plus/nginx-proxy-manager/docker-compose.yml
/root/Digital-Literacy-Wellbeing-60-plus/docker-compose.yml
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# cat /root/Digital-Literacy-Wellbeing-60-plus/docker-compose.yml 2>/dev/null
version: '3.8'

services:
  client:
    build:
      context: ./client
      args:
        - VITE_API_URL=${VITE_API_URL}
        - VITE_FIREBASE_apiKey=${VITE_FIREBASE_apiKey}
        - VITE_FIREBASE_authDomain=${VITE_FIREBASE_authDomain}
        - VITE_FIREBASE_projectId=${VITE_FIREBASE_projectId}
        - VITE_FIREBASE_storageBucket=${VITE_FIREBASE_storageBucket}
        - VITE_FIREBASE_messagingSenderId=${VITE_FIREBASE_messagingSenderId}
        - VITE_FIREBASE_appId=${VITE_FIREBASE_appId}
        - VITE_FIREBASE_measurementId=${VITE_FIREBASE_measurementId}
        - VITE_RECAPTCHA_SITE_KEY=${VITE_RECAPTCHA_SITE_KEY}
        - VITE_GA_TRACKING_ID=${VITE_GA_TRACKING_ID}
        - VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    expose:
      - "3000"
    depends_on:
      - server
    networks:
      - default
      - nginx-proxy

  server:
    build:
      context: ./server
    env_file:
      - ./.env
    depends_on:
      - db
    networks:
      - default
      - nginx-proxy

  db:
    image: postgres:16
    env_file:
      - ./.env
    volumes:
      - postgres_data:/var/lib/postgresql/data/

volumes:
  postgres_data:

networks:
  nginx-proxy:
    external: true
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# cat /etc/nginx/nginx.conf 2>/dev/null
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
        worker_connections 768;
        # multi_accept on;
}

http {

        ##
        # Basic Settings
        ##

        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 65;
        types_hash_max_size 2048;
        # server_tokens off;

        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;

        include /etc/nginx/mime.types;
        default_type application/octet-stream;

        ##
        # SSL Settings
        ##

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
        ssl_prefer_server_ciphers on;

        ##
        # Logging Settings
        ##

        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        ##
        # Gzip Settings
        ##

        gzip on;

        # gzip_vary on;
        # gzip_proxied any;
        # gzip_comp_level 6;
        # gzip_buffers 16 8k;
        # gzip_http_version 1.1;
        # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        ##
        # Virtual Host Configs
        ##

        include /etc/nginx/conf.d/*.conf;
        include /etc/nginx/sites-enabled/*;
}


#mail {
#       # See sample authentication script at:
#       # http://wiki.nginx.org/ImapAuthenticateWithApachePhpScript
#
#       # auth_http localhost/auth.php;
#       # pop3_capabilities "TOP" "USER";
#       # imap_capabilities "IMAP4rev1" "UIDPLUS";
#
#       server {
#               listen     localhost:110;
#               protocol   pop3;
#               proxy      on;
#       }
#
#       server {
#               listen     localhost:143;
#               protocol   imap;
#               proxy      on;
#       }
#}
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# ls /etc/nginx/sites-enabled/ 2>/dev/null
default
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# cat /etc/nginx/sites-enabled/* 2>/dev/null
##
# You should look at the following URL's in order to grasp a solid understanding
# of Nginx configuration files in order to fully unleash the power of Nginx.
# https://www.nginx.com/resources/wiki/start/
# https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/
# https://wiki.debian.org/Nginx/DirectoryStructure
#
# In most cases, administrators will remove this file from sites-enabled/ and
# leave it as reference inside of sites-available where it will continue to be
# updated by the nginx packaging team.
#
# This file will automatically load configuration files provided by other
# applications, such as Drupal or Wordpress. These applications will be made
# available underneath a path with that package name, such as /drupal8.
#
# Please see /usr/share/doc/nginx-doc/examples/ for more detailed examples.
##

# Default server configuration
#
server {
        listen 80 default_server;
        listen [::]:80 default_server;

        # SSL configuration
        #
        # listen 443 ssl default_server;
        # listen [::]:443 ssl default_server;
        #
        # Note: You should disable gzip for SSL traffic.
        # See: https://bugs.debian.org/773332
        #
        # Read up on ssl_ciphers to ensure a secure configuration.
        # See: https://bugs.debian.org/765782
        #
        # Self signed certs generated by the ssl-cert package
        # Don't use them in a production server!
        #
        # include snippets/snakeoil.conf;

        root /var/www/html;

        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;

        server_name pensa.club;

        location / {
                # First attempt to serve request as file, then
                # as directory, then fall back to displaying a 404.
                try_files $uri $uri/ =404;
        }

        # pass PHP scripts to FastCGI server
        #
        #location ~ \.php$ {
        #       include snippets/fastcgi-php.conf;
        #
        #       # With php-fpm (or other unix sockets):
        #       fastcgi_pass unix:/var/run/php/php7.4-fpm.sock;
        #       # With php-cgi (or other tcp sockets):
        #       fastcgi_pass 127.0.0.1:9000;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #       deny all;
        #}
}


# Virtual Host configuration for example.com
#
# You can move that to a different file under sites-available/ and symlink that
# to sites-enabled/ to enable it.
#
#server {
#       listen 80;
#       listen [::]:80;
#
#       server_name example.com;
#
#       root /var/www/example.com;
#       index index.html;
#
#       location / {
#               try_files $uri $uri/ =404;
#       }
#}
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# docker exec $(docker ps -q --filter "name=nginx") nginx -T 2>/dev/null
# configuration file /etc/nginx/nginx.conf:
# run nginx in foreground
daemon off;
pid /run/nginx/nginx.pid;
user npm;

# Set number of worker processes automatically based on number of CPU cores.
worker_processes auto;

# Enables the use of JIT for regular expressions to speed-up their processing.
pcre_jit on;

error_log /data/logs/fallback_error.log warn;

# Includes files with directives to load dynamic modules.
include /etc/nginx/modules/*.conf;

# Custom
include /data/nginx/custom/root_top[.]conf;

events {
        include /data/nginx/custom/events[.]conf;
}

http {
        include                       /etc/nginx/mime.types;
        default_type                  application/octet-stream;
        sendfile                      on;
        server_tokens                 off;
        tcp_nopush                    on;
        tcp_nodelay                   on;
        client_body_temp_path         /tmp/nginx/body 1 2;
        keepalive_timeout             90s;
        proxy_connect_timeout         90s;
        proxy_send_timeout            90s;
        proxy_read_timeout            90s;
        ssl_prefer_server_ciphers     on;
        gzip                          on;
        proxy_ignore_client_abort     off;
        client_max_body_size          2000m;
        server_names_hash_bucket_size 1024;
        proxy_http_version            1.1;
        proxy_set_header              X-Forwarded-Scheme $scheme;
        proxy_set_header              X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header              Accept-Encoding "";
        proxy_cache                   off;
        proxy_cache_path              /var/lib/nginx/cache/public  levels=1:2 keys_zone=public-cache:30m max_size=192m;
        proxy_cache_path              /var/lib/nginx/cache/private levels=1:2 keys_zone=private-cache:5m max_size=1024m;

        # Log format and fallback log file
        include /etc/nginx/conf.d/include/log.conf;

        # Dynamically generated resolvers file
        include /etc/nginx/conf.d/include/resolvers.conf;

        # Default upstream scheme
        map $host $forward_scheme {
                default http;
        }

        # Real IP Determination

        # Local subnets:
        set_real_ip_from 10.0.0.0/8;
        set_real_ip_from 172.16.0.0/12; # Includes Docker subnet
        set_real_ip_from 192.168.0.0/16;
        # NPM generated CDN ip ranges:
        include conf.d/include/ip_ranges.conf;
        # always put the following 2 lines after ip subnets:
        real_ip_header X-Real-IP;
        real_ip_recursive on;

        # Custom
        include /data/nginx/custom/http_top[.]conf;

        # Files generated by NPM
        include /etc/nginx/conf.d/*.conf;
        include /data/nginx/default_host/*.conf;
        include /data/nginx/proxy_host/*.conf;
        include /data/nginx/redirection_host/*.conf;
        include /data/nginx/dead_host/*.conf;
        include /data/nginx/temp/*.conf;

        # Custom
        include /data/nginx/custom/http[.]conf;
}

stream {
        # Files generated by NPM
        include /data/nginx/stream/*.conf;

        # Custom
        include /data/nginx/custom/stream[.]conf;
}

# Custom
include /data/nginx/custom/root[.]conf;

# configuration file /etc/nginx/mime.types:
types {
    text/html                                        html htm shtml;
    text/css                                         css;
    text/xml                                         xml;
    image/gif                                        gif;
    image/jpeg                                       jpeg jpg;
    application/javascript                           js;
    application/atom+xml                             atom;
    application/rss+xml                              rss;

    text/mathml                                      mml;
    text/plain                                       txt;
    text/vnd.sun.j2me.app-descriptor                 jad;
    text/vnd.wap.wml                                 wml;
    text/x-component                                 htc;

    image/png                                        png;
    image/svg+xml                                    svg svgz;
    image/tiff                                       tif tiff;
    image/vnd.wap.wbmp                               wbmp;
    image/webp                                       webp;
    image/x-icon                                     ico;
    image/x-jng                                      jng;
    image/x-ms-bmp                                   bmp;

    font/woff                                        woff;
    font/woff2                                       woff2;

    application/java-archive                         jar war ear;
    application/json                                 json;
    application/mac-binhex40                         hqx;
    application/msword                               doc;
    application/pdf                                  pdf;
    application/postscript                           ps eps ai;
    application/rtf                                  rtf;
    application/vnd.apple.mpegurl                    m3u8;
    application/vnd.google-earth.kml+xml             kml;
    application/vnd.google-earth.kmz                 kmz;
    application/vnd.ms-excel                         xls;
    application/vnd.ms-fontobject                    eot;
    application/vnd.ms-powerpoint                    ppt;
    application/vnd.oasis.opendocument.graphics      odg;
    application/vnd.oasis.opendocument.presentation  odp;
    application/vnd.oasis.opendocument.spreadsheet   ods;
    application/vnd.oasis.opendocument.text          odt;
    application/vnd.openxmlformats-officedocument.presentationml.presentation
                                                     pptx;
    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
                                                     xlsx;
    application/vnd.openxmlformats-officedocument.wordprocessingml.document
                                                     docx;
    application/vnd.wap.wmlc                         wmlc;
    application/x-7z-compressed                      7z;
    application/x-cocoa                              cco;
    application/x-java-archive-diff                  jardiff;
    application/x-java-jnlp-file                     jnlp;
    application/x-makeself                           run;
    application/x-perl                               pl pm;
    application/x-pilot                              prc pdb;
    application/x-rar-compressed                     rar;
    application/x-redhat-package-manager             rpm;
    application/x-sea                                sea;
    application/x-shockwave-flash                    swf;
    application/x-stuffit                            sit;
    application/x-tcl                                tcl tk;
    application/x-x509-ca-cert                       der pem crt;
    application/x-xpinstall                          xpi;
    application/xhtml+xml                            xhtml;
    application/xspf+xml                             xspf;
    application/zip                                  zip;

    application/octet-stream                         bin exe dll;
    application/octet-stream                         deb;
    application/octet-stream                         dmg;
    application/octet-stream                         iso img;
    application/octet-stream                         msi msp msm;

    audio/midi                                       mid midi kar;
    audio/mpeg                                       mp3;
    audio/ogg                                        ogg;
    audio/x-m4a                                      m4a;
    audio/x-realaudio                                ra;

    video/3gpp                                       3gpp 3gp;
    video/mp2t                                       ts;
    video/mp4                                        mp4;
    video/mpeg                                       mpeg mpg;
    video/quicktime                                  mov;
    video/webm                                       webm;
    video/x-flv                                      flv;
    video/x-m4v                                      m4v;
    video/x-mng                                      mng;
    video/x-ms-asf                                   asx asf;
    video/x-ms-wmv                                   wmv;
    video/x-msvideo                                  avi;
}

# configuration file /etc/nginx/conf.d/include/log.conf:
log_format proxy '[$time_local] $upstream_cache_status $upstream_status $status - $request_method $scheme $host "$request_uri" [Client $remote_addr] [Length $body_bytes_sent] [Gzip $gzip_ratio] [Sent-to $server] "$http_user_agent" "$http_referer"';
log_format standard '[$time_local] $status - $request_method $scheme $host "$request_uri" [Client $remote_addr] [Length $body_bytes_sent] [Gzip $gzip_ratio] "$http_user_agent" "$http_referer"';

access_log /data/logs/fallback_access.log proxy;

# configuration file /etc/nginx/conf.d/include/resolvers.conf:
resolver 127.0.0.11  valid=10s;

# configuration file /etc/nginx/conf.d/include/ip_ranges.conf:

set_real_ip_from 120.52.22.96/27;

set_real_ip_from 23.228.222.0/24;

set_real_ip_from 205.251.249.0/24;

set_real_ip_from 180.163.57.128/26;

set_real_ip_from 23.228.220.0/24;

set_real_ip_from 204.246.168.0/22;

set_real_ip_from 111.13.171.128/26;

set_real_ip_from 18.160.0.0/15;

set_real_ip_from 205.251.252.0/23;

set_real_ip_from 54.192.0.0/16;

set_real_ip_from 204.246.173.0/24;

set_real_ip_from 23.228.244.0/24;

set_real_ip_from 54.230.200.0/21;

set_real_ip_from 120.253.240.192/26;

set_real_ip_from 23.234.192.0/18;

set_real_ip_from 116.129.226.128/26;

set_real_ip_from 130.176.0.0/17;

set_real_ip_from 3.173.192.0/18;

set_real_ip_from 108.156.0.0/14;

set_real_ip_from 99.86.0.0/16;

set_real_ip_from 23.228.214.0/24;

set_real_ip_from 23.228.213.0/24;

set_real_ip_from 13.32.0.0/15;

set_real_ip_from 120.253.245.128/26;

set_real_ip_from 13.224.0.0/14;

set_real_ip_from 70.132.0.0/18;

set_real_ip_from 15.158.0.0/16;

set_real_ip_from 111.13.171.192/26;

set_real_ip_from 13.249.0.0/16;

set_real_ip_from 18.238.0.0/15;

set_real_ip_from 18.244.0.0/15;

set_real_ip_from 205.251.208.0/20;

set_real_ip_from 3.165.0.0/16;

set_real_ip_from 3.168.0.0/14;

set_real_ip_from 65.9.128.0/18;

set_real_ip_from 130.176.128.0/18;

set_real_ip_from 23.228.221.0/24;

set_real_ip_from 58.254.138.0/25;

set_real_ip_from 205.251.206.0/23;

set_real_ip_from 54.230.208.0/20;

set_real_ip_from 3.160.0.0/14;

set_real_ip_from 116.129.226.0/25;

set_real_ip_from 23.91.0.0/19;

set_real_ip_from 52.222.128.0/17;

set_real_ip_from 18.164.0.0/15;

set_real_ip_from 111.13.185.32/27;

set_real_ip_from 64.252.128.0/18;

set_real_ip_from 205.251.254.0/24;

set_real_ip_from 3.166.0.0/15;

set_real_ip_from 54.230.224.0/19;

set_real_ip_from 71.152.0.0/17;

set_real_ip_from 216.137.32.0/19;

set_real_ip_from 204.246.172.0/24;

set_real_ip_from 205.251.202.0/23;

set_real_ip_from 18.172.0.0/15;

set_real_ip_from 120.52.39.128/27;

set_real_ip_from 118.193.97.64/26;

set_real_ip_from 3.164.64.0/18;

set_real_ip_from 18.154.0.0/15;

set_real_ip_from 3.173.0.0/17;

set_real_ip_from 54.240.128.0/18;

set_real_ip_from 205.251.250.0/23;

set_real_ip_from 180.163.57.0/25;

set_real_ip_from 52.46.0.0/18;

set_real_ip_from 3.174.0.0/15;

set_real_ip_from 52.82.128.0/19;

set_real_ip_from 54.230.0.0/17;

set_real_ip_from 54.230.128.0/18;

set_real_ip_from 54.239.128.0/18;

set_real_ip_from 130.176.224.0/20;

set_real_ip_from 36.103.232.128/26;

set_real_ip_from 52.84.0.0/15;

set_real_ip_from 143.204.0.0/16;

set_real_ip_from 144.220.0.0/16;

set_real_ip_from 120.52.153.192/26;

set_real_ip_from 119.147.182.0/25;

set_real_ip_from 120.232.236.0/25;

set_real_ip_from 111.13.185.64/27;

set_real_ip_from 3.164.0.0/18;

set_real_ip_from 3.172.64.0/18;

set_real_ip_from 54.182.0.0/16;

set_real_ip_from 58.254.138.128/26;

set_real_ip_from 120.253.245.192/27;

set_real_ip_from 54.239.192.0/19;

set_real_ip_from 18.68.0.0/16;

set_real_ip_from 18.64.0.0/14;

set_real_ip_from 120.52.12.64/26;

set_real_ip_from 24.110.32.0/19;

set_real_ip_from 99.84.0.0/16;

set_real_ip_from 205.251.204.0/23;

set_real_ip_from 130.176.192.0/19;

set_real_ip_from 23.228.223.0/24;

set_real_ip_from 23.228.212.0/24;

set_real_ip_from 52.124.128.0/17;

set_real_ip_from 204.246.164.0/22;

set_real_ip_from 13.35.0.0/16;

set_real_ip_from 204.246.174.0/23;

set_real_ip_from 3.164.128.0/17;

set_real_ip_from 3.172.0.0/18;

set_real_ip_from 36.103.232.0/25;

set_real_ip_from 119.147.182.128/26;

set_real_ip_from 118.193.97.128/25;

set_real_ip_from 120.232.236.128/26;

set_real_ip_from 204.246.176.0/20;

set_real_ip_from 65.8.0.0/16;

set_real_ip_from 65.9.0.0/17;

set_real_ip_from 108.138.0.0/15;

set_real_ip_from 120.253.241.160/27;

set_real_ip_from 3.173.128.0/18;

set_real_ip_from 64.252.64.0/18;

set_real_ip_from 13.113.196.64/26;

set_real_ip_from 13.113.203.0/24;

set_real_ip_from 52.199.127.192/26;

set_real_ip_from 57.182.253.0/24;

set_real_ip_from 57.183.42.0/25;

set_real_ip_from 13.124.199.0/24;

set_real_ip_from 3.35.130.128/25;

set_real_ip_from 52.78.247.128/26;

set_real_ip_from 13.203.133.0/26;

set_real_ip_from 13.233.177.192/26;

set_real_ip_from 15.207.13.128/25;

set_real_ip_from 15.207.213.128/25;

set_real_ip_from 52.66.194.128/26;

set_real_ip_from 13.228.69.0/24;

set_real_ip_from 47.129.82.0/24;

set_real_ip_from 47.129.83.0/24;

set_real_ip_from 47.129.84.0/24;

set_real_ip_from 52.220.191.0/26;

set_real_ip_from 13.210.67.128/26;

set_real_ip_from 13.54.63.128/26;

set_real_ip_from 3.107.43.128/25;

set_real_ip_from 3.107.44.0/25;

set_real_ip_from 3.107.44.128/25;

set_real_ip_from 43.218.56.128/26;

set_real_ip_from 43.218.56.192/26;

set_real_ip_from 43.218.56.64/26;

set_real_ip_from 43.218.71.0/26;

set_real_ip_from 99.79.169.0/24;

set_real_ip_from 18.192.142.0/23;

set_real_ip_from 18.199.68.0/22;

set_real_ip_from 18.199.72.0/22;

set_real_ip_from 18.199.76.0/22;

set_real_ip_from 35.158.136.0/24;

set_real_ip_from 52.57.254.0/24;

set_real_ip_from 18.200.212.0/23;

set_real_ip_from 52.212.248.0/26;

set_real_ip_from 13.134.24.0/23;

set_real_ip_from 13.134.94.0/23;

set_real_ip_from 18.175.65.0/24;

set_real_ip_from 18.175.66.0/24;

set_real_ip_from 18.175.67.0/24;

set_real_ip_from 3.10.17.128/25;

set_real_ip_from 3.11.53.0/24;

set_real_ip_from 52.56.127.0/25;

set_real_ip_from 15.188.184.0/24;

set_real_ip_from 51.44.234.0/23;

set_real_ip_from 51.44.236.0/23;

set_real_ip_from 51.44.238.0/23;

set_real_ip_from 52.47.139.0/24;

set_real_ip_from 3.29.40.128/26;

set_real_ip_from 3.29.40.192/26;

set_real_ip_from 3.29.40.64/26;

set_real_ip_from 3.29.57.0/26;

set_real_ip_from 18.229.220.192/26;

set_real_ip_from 18.230.229.0/24;

set_real_ip_from 18.230.230.0/25;

set_real_ip_from 54.233.255.128/26;

set_real_ip_from 56.125.46.0/24;

set_real_ip_from 56.125.47.0/32;

set_real_ip_from 56.125.48.0/24;

set_real_ip_from 3.231.2.0/25;

set_real_ip_from 3.234.232.224/27;

set_real_ip_from 3.236.169.192/26;

set_real_ip_from 3.236.48.0/23;

set_real_ip_from 34.195.252.0/24;

set_real_ip_from 34.226.14.0/24;

set_real_ip_from 44.220.194.0/23;

set_real_ip_from 44.220.196.0/23;

set_real_ip_from 44.220.198.0/23;

set_real_ip_from 44.220.200.0/23;

set_real_ip_from 44.220.202.0/23;

set_real_ip_from 44.222.66.0/24;

set_real_ip_from 13.59.250.0/26;

set_real_ip_from 18.216.170.128/25;

set_real_ip_from 3.128.93.0/24;

set_real_ip_from 3.134.215.0/24;

set_real_ip_from 3.146.232.0/22;

set_real_ip_from 3.147.164.0/22;

set_real_ip_from 3.147.244.0/22;

set_real_ip_from 52.15.127.128/26;

set_real_ip_from 3.101.158.0/23;

set_real_ip_from 52.52.191.128/26;

set_real_ip_from 34.216.51.0/25;

set_real_ip_from 34.223.12.224/27;

set_real_ip_from 34.223.80.192/26;

set_real_ip_from 35.162.63.192/26;

set_real_ip_from 35.167.191.128/26;

set_real_ip_from 35.93.168.0/23;

set_real_ip_from 35.93.170.0/23;

set_real_ip_from 35.93.172.0/23;

set_real_ip_from 44.227.178.0/24;

set_real_ip_from 44.234.108.128/25;

set_real_ip_from 44.234.90.252/30;

set_real_ip_from 2600:9000:3000::/36;

set_real_ip_from 2600:9000:f600::/39;

set_real_ip_from 2600:9000:f540::/42;

set_real_ip_from 2409:8c00:2421:300::/56;

set_real_ip_from 2600:9000:f000::/38;

set_real_ip_from 2600:9000:f500::/43;

set_real_ip_from 2600:9000:ddd::/48;

set_real_ip_from 2600:9000:f800::/37;

set_real_ip_from 2600:9000:f400::/40;

set_real_ip_from 2600:9000:f538::/45;

set_real_ip_from 2600:9000:5380::/41;

set_real_ip_from 2600:f0f0:5504::/46;

set_real_ip_from 2600:9000:1000::/36;

set_real_ip_from 2600:9000:2000::/36;

set_real_ip_from 2400:7fc0:500::/40;

set_real_ip_from 2600:9000:4000::/36;

set_real_ip_from 2600:9000:fff::/48;

set_real_ip_from 2409:8c00:2421:400::/56;

set_real_ip_from 2404:c2c0:500::/40;

set_real_ip_from 2600:9000:5308::/45;

set_real_ip_from 2600:9000:f534::/46;

set_real_ip_from 2600:f0f0:601::/48;

set_real_ip_from 2600:9000:f520::/44;

set_real_ip_from 2600:9000:5320::/43;

set_real_ip_from 2600:9000:5310::/44;

set_real_ip_from 2600:9000:f580::/41;

set_real_ip_from 2600:f0f0:602::/47;

set_real_ip_from 2600:9000:5340::/42;

set_real_ip_from 2600:9000:eee::/48;

set_real_ip_from 2600:9000:5200::/40;

set_real_ip_from 173.245.48.0/20;

set_real_ip_from 103.21.244.0/22;

set_real_ip_from 103.22.200.0/22;

set_real_ip_from 103.31.4.0/22;

set_real_ip_from 141.101.64.0/18;

set_real_ip_from 108.162.192.0/18;

set_real_ip_from 190.93.240.0/20;

set_real_ip_from 188.114.96.0/20;

set_real_ip_from 197.234.240.0/22;

set_real_ip_from 198.41.128.0/17;

set_real_ip_from 162.158.0.0/15;

set_real_ip_from 104.16.0.0/13;

set_real_ip_from 104.24.0.0/14;

set_real_ip_from 172.64.0.0/13;

set_real_ip_from 131.0.72.0/22;

set_real_ip_from 2400:cb00::/32;

set_real_ip_from 2606:4700::/32;

set_real_ip_from 2803:f800::/32;

set_real_ip_from 2405:b500::/32;

set_real_ip_from 2405:8100::/32;

set_real_ip_from 2a06:98c0::/29;

set_real_ip_from 2c0f:f248::/32;

# configuration file /etc/nginx/conf.d/default.conf:
# "You are not configured" page, which is the default if another default doesn't exist
server {
        listen 80;
        listen [::]:80;

        set $forward_scheme "http";
        set $server "127.0.0.1";
        set $port "80";

        server_name localhost-nginx-proxy-manager;
        access_log /data/logs/fallback_access.log standard;
        error_log /data/logs/fallback_error.log warn;
        include conf.d/include/assets.conf;
        include conf.d/include/block-exploits.conf;
        include conf.d/include/letsencrypt-acme-challenge.conf;

        location / {
                index index.html;
                root /var/www/html;
        }
}

# First 443 Host, which is the default if another default doesn't exist
server {
        listen 443 ssl;
        listen [::]:443 ssl;

        set $forward_scheme "https";
        set $server "127.0.0.1";
        set $port "443";

        server_name localhost;
        access_log /data/logs/fallback_access.log standard;
        error_log /dev/null crit;
        include conf.d/include/ssl-ciphers.conf;
        ssl_reject_handshake on;

        return 444;
}

# configuration file /etc/nginx/conf.d/include/assets.conf:
location ~* ^.*\.(css|js|jpe?g|gif|png|webp|woff|woff2|eot|ttf|svg|ico|css\.map|js\.map)$ {
        if_modified_since off;

        # use the public cache
        proxy_cache public-cache;
        proxy_cache_key $host$request_uri;

        # ignore these headers for media
        proxy_ignore_headers Set-Cookie Cache-Control Expires X-Accel-Expires;

        # cache 200s and also 404s (not ideal but there are a few 404 images for some reason)
        proxy_cache_valid any 30m;
        proxy_cache_valid 404 1m;

        # strip this header to avoid If-Modified-Since requests
        proxy_hide_header Last-Modified;
        proxy_hide_header Cache-Control;
        proxy_hide_header Vary;

        proxy_cache_bypass 0;
        proxy_no_cache 0;

        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504 http_404;
        proxy_connect_timeout 5s;
        proxy_read_timeout 45s;

        expires @30m;
        access_log  off;

        include conf.d/include/proxy.conf;
}

# configuration file /etc/nginx/conf.d/include/proxy.conf:
add_header       X-Served-By $host;
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Scheme $scheme;
proxy_set_header X-Forwarded-Proto  $scheme;
proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP          $remote_addr;
proxy_pass       $forward_scheme://$server:$port$request_uri;

# configuration file /etc/nginx/conf.d/include/block-exploits.conf:
## Block SQL injections
set $block_sql_injections 0;

if ($query_string ~ "union.*select.*\(") {
        set $block_sql_injections 1;
}

if ($query_string ~ "union.*all.*select.*") {
        set $block_sql_injections 1;
}

if ($query_string ~ "concat.*\(") {
        set $block_sql_injections 1;
}

if ($block_sql_injections = 1) {
        return 403;
}

## Block file injections
set $block_file_injections 0;

if ($query_string ~ "[a-zA-Z0-9_]=http://") {
        set $block_file_injections 1;
}

if ($query_string ~ "[a-zA-Z0-9_]=(\.\.//?)+") {
        set $block_file_injections 1;
}

if ($query_string ~ "[a-zA-Z0-9_]=/([a-z0-9_.]//?)+") {
        set $block_file_injections 1;
}

if ($block_file_injections = 1) {
        return 403;
}

## Block common exploits
set $block_common_exploits 0;

if ($query_string ~ "(<|%3C).*script.*(>|%3E)") {
        set $block_common_exploits 1;
}

if ($query_string ~ "GLOBALS(=|\[|\%[0-9A-Z]{0,2})") {
        set $block_common_exploits 1;
}

if ($query_string ~ "_REQUEST(=|\[|\%[0-9A-Z]{0,2})") {
        set $block_common_exploits 1;
}

if ($query_string ~ "proc/self/environ") {
        set $block_common_exploits 1;
}

if ($query_string ~ "mosConfig_[a-zA-Z_]{1,21}(=|\%3D)") {
        set $block_common_exploits 1;
}

if ($query_string ~ "base64_(en|de)code\(.*\)") {
        set $block_common_exploits 1;
}

if ($block_common_exploits = 1) {
        return 403;
}

## Block spam
set $block_spam 0;

if ($query_string ~ "\b(ultram|unicauca|valium|viagra|vicodin|xanax|ypxaieo)\b") {
        set $block_spam 1;
}

if ($query_string ~ "\b(erections|hoodia|huronriveracres|impotence|levitra|libido)\b") {
        set $block_spam 1;
}

if ($query_string ~ "\b(ambien|blue\spill|cialis|cocaine|ejaculation|erectile)\b") {
        set $block_spam 1;
}

if ($query_string ~ "\b(lipitor|phentermin|pro[sz]ac|sandyauer|tramadol|troyhamby)\b") {
        set $block_spam 1;
}

if ($block_spam = 1) {
        return 403;
}

## Block user agents
set $block_user_agents 0;

# Disable Akeeba Remote Control 2.5 and earlier
if ($http_user_agent ~ "Indy Library") {
        set $block_user_agents 1;
}

# Common bandwidth hoggers and hacking tools.
if ($http_user_agent ~ "libwww-perl") {
        set $block_user_agents 1;
}

if ($http_user_agent ~ "GetRight") {
        set $block_user_agents 1;
}

if ($http_user_agent ~ "GetWeb!") {
        set $block_user_agents 1;
}

if ($http_user_agent ~ "Go!Zilla") {
        set $block_user_agents 1;
}

if ($http_user_agent ~ "Download Demon") {
        set $block_user_agents 1;
}

if ($http_user_agent ~ "Go-Ahead-Got-It") {
        set $block_user_agents 1;
}

if ($http_user_agent ~ "TurnitinBot") {
        set $block_user_agents 1;
}

if ($http_user_agent ~ "GrabNet") {
        set $block_user_agents 1;
}

if ($block_user_agents = 1) {
        return 403;
}

# configuration file /etc/nginx/conf.d/include/letsencrypt-acme-challenge.conf:
# Rule for legitimate ACME Challenge requests (like /.well-known/acme-challenge/xxxxxxxxx)
# We use ^~ here, so that we don't check other regexes (for speed-up). We actually MUST cancel
# other regex checks, because in our other config files have regex rule that denies access to files with dotted names.
location ^~ /.well-known/acme-challenge/ {
        # Since this is for letsencrypt authentication of a domain and they do not give IP ranges of their infrastructure
        # we need to open up access by turning off auth and IP ACL for this location.
        auth_basic off;
        auth_request off;
        allow all;

        # Set correct content type. According to this:
        # https://community.letsencrypt.org/t/using-the-webroot-domain-verification-method/1445/29
        # Current specification requires "text/plain" or no content header at all.
        # It seems that "text/plain" is a safe option.
        default_type "text/plain";

        # This directory must be the same as in /etc/letsencrypt/cli.ini
        # as "webroot-path" parameter. Also don't forget to set "authenticator" parameter
        # there to "webroot".
        # Do NOT use alias, use root! Target directory is located here:
        # /var/www/common/letsencrypt/.well-known/acme-challenge/
        root /data/letsencrypt-acme-challenge;
}

# Hide /acme-challenge subdirectory and return 404 on all requests.
# It is somewhat more secure than letting Nginx return 403.
# Ending slash is important!
location = /.well-known/acme-challenge/ {
        return 404;
}

# configuration file /etc/nginx/conf.d/include/ssl-ciphers.conf:
# intermediate configuration. tweak to your needs.
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers off;

# configuration file /etc/nginx/conf.d/production.conf:
# Admin Interface
server {
        listen 81 default;
        listen [::]:81 default;

        server_name nginxproxymanager;
        root /app/frontend;
        access_log /dev/null;

        location /api {
                return 302 /api/;
        }

        location /api/ {
                add_header            X-Served-By $host;
                proxy_set_header Host $host;
                proxy_set_header      X-Forwarded-Scheme $scheme;
                proxy_set_header      X-Forwarded-Proto  $scheme;
                proxy_set_header      X-Forwarded-For    $remote_addr;
                proxy_pass            http://127.0.0.1:3000/;

                proxy_read_timeout 15m;
                proxy_send_timeout 15m;
        }

        location / {
                index index.html;
                if ($request_uri ~ ^/(.*)\.html$) {
                        return 302 /$1;
                }
                try_files $uri $uri.html $uri/ /index.html;
        }
}

# configuration file /data/nginx/proxy_host/1.conf:
# ------------------------------------------------------------
# pensa.club
# ------------------------------------------------------------
map $scheme $hsts_header {
    https   "max-age=63072000; preload";
}

# Bot detection map
map $http_user_agent $is_bot {
    default                                     0;
    ~*facebookexternalhit                      1;
    ~*Facebot                                  1;
    ~*Twitterbot                               1;
    ~*LinkedInBot                              1;
    ~*Slackbot                                 1;
    ~*WhatsApp                                 1;
    ~*TelegramBot                              1;
    ~*googlebot                                1;
    ~*bingbot                                  1;
}

map $is_bot $backend_host {
    0       "digital-literacy-wellbeing-60-plus-client-1";
    1       "digital-literacy-wellbeing-60-plus-server-1";
}

map $is_bot $backend_port {
    0       "3000";
    1       "8080";
}

server {
  set $forward_scheme http;
  set $server         "digital-literacy-wellbeing-60-plus-client-1";
  set $port           3000;

  listen 80;
  listen [::]:80;
  listen 443 ssl;
  listen [::]:443 ssl;

  server_name pensa.club;
  http2 on;

  # Let's Encrypt SSL
  include conf.d/include/letsencrypt-acme-challenge.conf;
  include conf.d/include/ssl-cache.conf;
  include conf.d/include/ssl-ciphers.conf;
  ssl_certificate /etc/letsencrypt/live/npm-2/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/npm-2/privkey.pem;

  # Force SSL
  include conf.d/include/force-ssl.conf;

  access_log /data/logs/proxy-host-1_access.log proxy;
  error_log /data/logs/proxy-host-1_error.log warn;

  location /api {
    rewrite ^/api/(.*)$ /$1 break;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Scheme $scheme;
    proxy_set_header X-Forwarded-Proto  $scheme;
    proxy_set_header X-Forwarded-For    $remote_addr;
    proxy_set_header X-Real-IP          $remote_addr;
    proxy_set_header User-Agent         $http_user_agent;
    proxy_pass       http://digital-literacy-wellbeing-60-plus-server-1:8080;
    # Force SSL
    include conf.d/include/force-ssl.conf;
  }
  error_page 502 @maintenance;
  location @maintenance {
      default_type text/html;
      return 502 '<!DOCTYPE html><html lang="bg"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>pensa.club</title><style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%);font-family:system-ui,sans-serif;color:#e2e8f0;text-align:center;padding:20px}.c{max-width:480px}.i{font-size:64px;margin-bottom:24px;animation:p 2s ease-in-out infinite}h1{font-size:24px;font-weight:700;margin-bottom:12px;color:#f8fafc}p{font-size:16px;color:#94a3b8;line-height:1.6;margin-bottom:8px}.d{display:inline-flex;gap:6px;margin-top:24px}.d span{width:8px;height:8px;border-radius:50%;background:#E26020;animation:b 1.4s ease-in-out infinite}.d span:nth-child(2){animation-delay:.2s}.d span:nth-child(3){animation-delay:.4s}@keyframes p{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}@keyframes b{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-12px);opacity:1}}.f{margin-top:32px;font-size:13px;color:#475569}</style></head><body><div class="c"><div class="i">🔧</div><h1>Сайтът се актуализира</h1><p>В момента инсталираме подобрения.</p><p>Ще бъдем готови след няколко минути.</p><div class="d"><span></span><span></span><span></span></div><div class="f">pensa.club</div></div></body></html>';
  }
  location / {
    # Bot-aware proxy using map variables
    proxy_pass http://$backend_host:$backend_port;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Scheme $scheme;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header User-Agent $http_user_agent;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
  }

  # Custom
  include /data/nginx/custom/server_proxy[.]conf;
}

# configuration file /etc/nginx/conf.d/include/ssl-cache.conf:
ssl_session_timeout 5m;
ssl_session_cache shared:SSL:50m;

# configuration file /etc/nginx/conf.d/include/force-ssl.conf:
set $test "";
if ($scheme = "http") {
        set $test "H";
}
if ($request_uri = /.well-known/acme-challenge/test-challenge) {
        set $test "${test}T";
}
if ($test = H) {
        return 301 https://$host$request_uri;
}

root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# sudo fail2ban-client status sshd
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     9994
|  `- File list:        /var/log/auth.log
`- Actions
   |- Currently banned: 251
   |- Total banned:     3230
   `- Banned IP list:   24.199.121.15 134.122.110.105 159.65.197.4 164.92.219.1 36.92.84.132 188.166.91.224 102.42.25.244 66.29.128.133 159.65.120.94 188.166.57.252 170.64.150.76 167.99.56.120 115.190.241.219 92.38.135.109 112.66.224.67 8.138.206.71 189.147.237.190 1.94.179.216 185.196.10.227 144.31.122.188 45.144.233.56 147.182.153.180 162.243.229.98 150.241.113.104 139.59.96.178 103.61.122.229 159.89.1.192 78.128.112.74 212.175.150.188 81.9.131.168 194.163.183.155 46.17.248.205 34.140.46.193 34.38.176.240 164.90.198.5 165.154.11.64 46.101.168.121 34.76.120.127 157.230.190.118 188.166.24.202 43.226.39.177 134.199.164.59 134.209.190.155 34.140.244.137 34.140.124.220 143.110.186.13 27.112.79.178 125.138.175.113 35.205.54.127 46.101.228.165 188.166.49.241 157.245.193.43 46.101.251.163 152.32.211.238 135.232.121.138 103.172.113.192 209.38.93.137 209.38.18.105 43.163.111.111 157.230.219.41 157.230.83.123 143.198.135.63 104.248.94.247 104.248.80.228 192.241.130.230 119.203.109.69 61.161.62.130 188.166.54.43 152.32.129.17 146.190.147.62 141.98.11.155 91.224.92.50 219.78.63.235 161.35.135.113 152.32.209.152 35.205.64.180 36.108.170.78 167.160.161.229 209.97.168.111 43.133.62.11 162.243.174.75 85.24.209.239 45.55.188.115 34.62.209.131 46.182.80.178 213.225.7.58 170.64.142.60 91.224.92.22 82.158.230.80 185.148.13.227 138.68.133.32 93.115.175.232 115.190.50.19 141.98.11.166 93.123.109.176 143.110.255.64 157.245.116.37 205.254.166.119 80.87.83.229 64.23.247.60 221.182.17.158 58.249.150.252 38.10.129.136 38.10.129.131 38.10.129.137 165.227.194.162 81.177.140.163 174.4.145.19 219.151.148.243 106.53.181.163 180.245.130.159 87.180.15.242 101.91.214.87 1.15.29.58 209.97.137.164 154.70.102.114 116.177.174.231 159.65.31.10 134.199.159.22 134.122.71.6 112.164.20.69 170.64.202.211 170.64.210.134 50.104.70.175 91.224.92.78 45.148.10.147 120.48.99.236 218.76.247.30 134.209.18.150 14.29.245.15 103.59.94.77 87.156.185.48 183.56.226.198 140.249.223.190 119.28.181.157 193.112.169.28 45.148.10.151 196.189.51.112 14.103.99.176 186.39.72.50 112.6.211.247 181.228.191.181 14.116.207.22 101.91.211.175 1.12.45.226 205.254.166.153 103.191.92.72 170.64.223.75 113.201.153.167 120.48.52.177 139.59.41.236 58.125.150.74 165.154.254.11 124.222.58.178 125.72.8.199 189.178.17.1 91.224.92.54 43.140.34.134 103.59.94.19 134.209.152.41 34.38.62.204 114.117.235.105 68.183.204.19 115.190.215.117 51.15.145.206 190.105.217.202 103.175.225.238 101.36.108.213 106.52.220.152 139.59.31.28 178.62.246.234 47.97.127.96 152.32.187.135 103.76.120.206 60.214.113.146 219.152.230.125 121.165.84.80 45.148.10.141 174.138.8.30 209.38.83.171 170.64.220.239 159.65.44.8 103.63.25.198 189.165.12.51 103.37.6.51 89.125.39.157 170.84.204.2 1.238.114.145 157.245.220.205 103.154.158.70 34.76.178.50 206.189.120.47 103.161.16.196 64.225.74.65 162.243.22.252 218.200.173.73 107.170.60.122 64.227.165.55 106.75.162.193 58.249.140.45 170.64.128.103 212.233.136.201 170.64.235.1 8.154.6.154 134.199.157.245 45.148.10.157 37.211.169.182 84.252.74.210 20.164.21.26 106.12.168.187 66.181.171.136 146.190.232.252 185.196.10.164 35.241.215.39 165.22.235.132 206.62.67.46 182.93.7.194 152.32.226.88 20.105.65.67 152.32.226.33 165.22.125.112 36.133.208.182 162.243.231.118 65.21.248.18 118.196.44.152 134.199.170.60 188.138.28.149 103.146.202.84 143.110.216.137 64.227.191.71 118.193.33.139 170.64.129.129 64.227.191.198 103.39.222.143 170.64.155.151 159.195.67.23 14.225.2.105 81.85.77.230 154.116.240.3 36.50.55.106 209.38.95.66 209.38.87.147 86.127.233.218 206.189.20.2 103.59.95.144 170.64.132.134 34.78.76.210 209.38.90.73 216.51.185.180 170.64.222.62 170.64.139.17
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# sudo iptables -L -n | grep -E "ACCEPT|DROP|whitelist"
Chain INPUT (policy ACCEPT)
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED,DNAT
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
DROP       all  --  0.0.0.0/0            0.0.0.0/0            ctstate INVALID
Chain FORWARD (policy DROP)
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED,DNAT
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
DROP       all  --  0.0.0.0/0            0.0.0.0/0            ctstate INVALID
Chain OUTPUT (policy ACCEPT)
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
ACCEPT     tcp  --  0.0.0.0/0            172.19.0.4           tcp dpt:443
ACCEPT     tcp  --  0.0.0.0/0            172.19.0.4           tcp dpt:81
ACCEPT     tcp  --  0.0.0.0/0            172.19.0.4           tcp dpt:80
DROP       all  --  0.0.0.0/0            0.0.0.0/0
DROP       all  --  0.0.0.0/0            0.0.0.0/0
DROP       all  --  0.0.0.0/0            0.0.0.0/0
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            ctstate RELATED,ESTABLISHED
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
DROP       all  --  0.0.0.0/0            0.0.0.0/0
DROP       all  --  0.0.0.0/0            0.0.0.0/0
DROP       all  --  0.0.0.0/0            0.0.0.0/0
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
ACCEPT     icmp --  0.0.0.0/0            0.0.0.0/0
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0
ACCEPT     icmp --  0.0.0.0/0            0.0.0.0/0
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:22 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:443 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:25 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:465 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:143 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:993 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:110 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:995 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:21 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:53 ctstate NEW,UNTRACKED
ACCEPT     udp  --  0.0.0.0/0            0.0.0.0/0            udp dpt:53 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:1022 ctstate NEW,UNTRACKED
ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:8022 ctstate NEW,UNTRACKED
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# cat /etc/fail2ban/jail.local 2>/dev/null
[DEFAULT]
# Твоето IP никога няма да се блокира
ignoreip = 127.0.0.1/8 ::1 78.154.13.95
# Време за блокиране в секунди (168 часа)
bantime = 604800
# Прозорец за време в който се броят неуспешните опити (10 минути)
findtime = 600
# Максимален брой неуспешни опити преди блокиране
maxretry = 2

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# grep -r "trust proxy\|trustProxy\|set('trust" /root/Digital-Literacy-Wellbeing-60-plus/server/ 2>/dev/null
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# grep -r "proxy" /root/Digital-Literacy-Wellbeing-60-plus/server/index.js 2>/dev/null
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus# ss -tlnp | grep -E "LISTEN"
LISTEN    0         4096               0.0.0.0:443              0.0.0.0:*        users:(("docker-proxy",pid=8858,fd=7))
LISTEN    0         4096               0.0.0.0:80               0.0.0.0:*        users:(("docker-proxy",pid=8825,fd=7))
LISTEN    0         4096               0.0.0.0:81               0.0.0.0:*        users:(("docker-proxy",pid=8838,fd=7))
LISTEN    0         4096         127.0.0.53%lo:53               0.0.0.0:*        users:(("systemd-resolve",pid=806,fd=13))
LISTEN    0         128                0.0.0.0:22               0.0.0.0:*        users:(("sshd",pid=866,fd=3))
LISTEN    0         128              127.0.0.1:6010             0.0.0.0:*        users:(("sshd",pid=119211,fd=10))
LISTEN    0         4096                  [::]:443                 [::]:*        users:(("docker-proxy",pid=8866,fd=7))
LISTEN    0         4096                  [::]:80                  [::]:*        users:(("docker-proxy",pid=8831,fd=7))
LISTEN    0         4096                  [::]:81                  [::]:*        users:(("docker-proxy",pid=8849,fd=7))
LISTEN    0         128                   [::]:22                  [::]:*        users:(("sshd",pid=866,fd=4))
LISTEN    0         128                  [::1]:6010                [::]:*        users:(("sshd",pid=119211,fd=9))
root@uxla0m4m:~/Digital-Literacy-Wellbeing-60-plus#
