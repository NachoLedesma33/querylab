package com.querylab.api.infrastructure.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final Map<String, Window> clients = new ConcurrentHashMap<>();

    private static final int MAX_REQUESTS = 20;
    private static final long WINDOW_MS = 60_000;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!request.getRequestURI().startsWith("/api/")) {
            return true;
        }

        String ip = request.getRemoteAddr();
        long now = System.currentTimeMillis();

        Window window = clients.compute(ip, (key, existing) -> {
            if (existing == null || (now - existing.start) > WINDOW_MS) {
                return new Window(now, new AtomicInteger(1));
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (window.count.get() > MAX_REQUESTS) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            String body = "{\"message\":\"Too many requests. You can execute up to " + MAX_REQUESTS +
                " queries per minute. Please wait a moment before trying again.\"}";
            response.getWriter().write(body);
            return false;
        }

        return true;
    }

    private record Window(long start, AtomicInteger count) {}

    public void reset() {
        clients.clear();
    }
}
