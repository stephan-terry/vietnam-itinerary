# Vietnam Travel Itinerary

A self-contained, responsive HTML travel guide for a 10-day Vietnam trip (June 8–17, 2025).

## Route
**Hanoi → Sa Pa → Da Nang / Hoi An → Ho Chi Minh City**

## Features
- Full day-by-day itinerary with times, costs, and Google Maps links
- Collapsible day cards
- Sticky navigation
- Budget summary
- Essential travel info (visa, SIM, money, health)
- Mobile-responsive
- Print-friendly

## Hosting on Unraid

### Option 1: Docker Compose
```bash
docker compose up -d --build
```
The site will be available on port **8088**.

### Option 2: Unraid Docker UI
1. Copy `index.html` to a share on your Unraid server (e.g. `/mnt/user/appdata/vietnam-itinerary/`)
2. Add a new Docker container using the **nginx** image
3. Map port **80** in the container to your desired host port (e.g. **8088**)
4. Add a path mapping: `/mnt/user/appdata/vietnam-itinerary/` → `/usr/share/nginx/html/`
5. Start the container

### Cloudflare DNS
Point your desired subdomain (e.g. `vietnam.yourdomain.com`) to your Unraid server's public IP or Cloudflare tunnel. Make sure the port is accessible or use a Cloudflare Tunnel for zero-config HTTPS.
