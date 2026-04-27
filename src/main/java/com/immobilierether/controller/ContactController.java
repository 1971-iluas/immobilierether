package com.immobilierether.controller;

import com.immobilierether.model.ContactMessage;
import com.immobilierether.service.ContactMessageService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ContactController {

    private final ContactMessageService service;

    public ContactController(ContactMessageService service) {
        this.service = service;
    }

    @PostMapping("/contact/send")
    public String sendContact(
            @RequestParam String fullName,
            @RequestParam String email,
            @RequestParam String subject,
            @RequestParam String message
    ) {
        ContactMessage contactMessage = new ContactMessage();
        contactMessage.setFullName(fullName);
        contactMessage.setEmail(email);
        contactMessage.setSubject(subject);
        contactMessage.setMessage(message);

        service.saveMessage(contactMessage);

        return "redirect:/contact?success";
    }
}