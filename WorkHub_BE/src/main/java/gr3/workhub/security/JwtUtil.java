//package gr3.workhub.security;
//
//import io.jsonwebtoken.*;
//import io.jsonwebtoken.security.Keys;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Component;
//
//import javax.annotation.PostConstruct;
//import javax.crypto.SecretKey;
//import java.util.Date;
//
//@Component
//public class JwtUtil {
//
//    @Value("${jwt.secret}")
//    private String secretKeyString;
//
//    private SecretKey secretKey;
//
//    private final long jwtExpirationMs = 86_400_000; // 1 day
//    private final long activationExpirationMs = 3_600_000; // 1 hour
//
//    @PostConstruct
//    public void init() {
//        this.secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
//    }
//
//    public String generateToken(String subject, String role) {
//        return Jwts.builder()
//                .setSubject(subject)
//                .claim("role", role)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
//                .signWith(secretKey, SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public String generateActivationToken(String subject) {
//        return Jwts.builder()
//                .setSubject(subject)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + activationExpirationMs))
//                .signWith(secretKey, SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public String getUsernameFromToken(String token) {
//        return parseToken(token).getBody().getSubject();
//    }
//
//    public String getRoleFromToken(String token) {
//        return (String) parseToken(token).getBody().get("role");
//    }
//
//    public boolean validateToken(String token) {
//        try {
//            parseToken(token);
//            return true;
//        } catch (JwtException | IllegalArgumentException e) {
//            return false;
//        }
//    }
//
//    private Jws<Claims> parseToken(String token) {
//        return Jwts.parserBuilder()
//                .setSigningKey(secretKey)
//                .build()
//                .parseClaimsJws(token);
//    }
//}
