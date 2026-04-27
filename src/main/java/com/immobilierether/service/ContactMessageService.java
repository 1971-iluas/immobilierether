package com.immobilierether.service;

import com.immobilierether.model.ContactMessage;
import com.immobilierether.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContactMessageService {

    private final ContactMessageRepository repository;

    public ContactMessageService(ContactMessageRepository repository) {
        this.repository = repository;
    }

    public void saveMessage(ContactMessage message) {
        repository.save(message);
    }

    public List<ContactMessage> getAllMessages() {
        return repository.findAll();
    }
}