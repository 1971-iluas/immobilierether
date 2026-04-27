package com.immobilierether.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/entreprise")
    public String entreprise() {
        return "entreprise";
    }

    @GetMapping("/services")
    public String services() {
        return "services";
    }

    @GetMapping("/apropos")
    public String apropos() {
        return "apropos";
    }

    @GetMapping("/videos")
    public String videos() {
        return "videos";
    }

    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
}