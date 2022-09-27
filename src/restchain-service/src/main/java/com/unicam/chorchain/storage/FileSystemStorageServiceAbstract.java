package com.unicam.chorchain.storage;

import com.unicam.chorchain.choreography.UploadFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;

import javax.annotation.PostConstruct;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.stream.Stream;


public abstract class  FileSystemStorageServiceAbstract {

    protected abstract String getDir();

    private Path rootLocation;


    public void store(UploadFile file) {
        String filename = StringUtils.cleanPath(file.getFilename());
        try {
            if (file.getFilename().isEmpty()) {
                throw new StorageException("Failed to store empty file " + filename);
            }

            if (!file.isOverwrite() && fileExists(file.getFilename())) {
                throw new StorageFileAlreadyExistsException("File already exists " + filename);
            }
//            if (filename.contains("..")) {
//                // This is a security check
//                throw new StorageException(
//                        "Cannot store file with relative path outside current directory "
//                                + filename);
//            }
            try (InputStream targetStream = new ByteArrayInputStream(file.getData().getBytes())) {
                Files.copy(targetStream, this.rootLocation.resolve(filename),
                        StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new StorageException("Failed to store file " + filename, e);
        }
    }

    public void storeSolidity(UploadFile file, String dir) {
        rootLocation = Paths.get(dir);
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage", e);
        }

        String filename = StringUtils.cleanPath(file.getFilename());
        try {
            if (file.getFilename().isEmpty()) {
                throw new StorageException("Failed to store empty file " + filename);
            }

            if (fileExists(file.getFilename())) {
                delete(file.getFilename());
            }
//            if (filename.contains("..")) {
//                // This is a security check
//                throw new StorageException(
//                        "Cannot store file with relative path outside current directory "
//                                + filename);
//            }
            try (InputStream targetStream = new ByteArrayInputStream(file.getData().getBytes())) {
                Files.copy(targetStream, this.rootLocation.resolve(filename),
                        StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException e) {
            throw new StorageException("Failed to store file " + filename, e);
        }
    }


    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.rootLocation, 1)
                    .filter(path -> !path.equals(this.rootLocation))
                    .map(this.rootLocation::relativize);
        } catch (IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }
    }

    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    public Resource loadAsResource(String filename) {
        try {
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new StorageFileNotFoundException(
                        "Could not read file: " + filename);

            }
        } catch (MalformedURLException e) {
            throw new StorageFileNotFoundException("Could not read file: " + filename, e);
        }
    }

    public Boolean fileExists(String filename) {
        try {
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return true;
            }
        } catch (MalformedURLException e) {
            throw new StorageFileNotFoundException("Could not read file: " + filename, e);
        }
        return false;
    }

    public void deleteAll() {
        FileSystemUtils.deleteRecursively(rootLocation.toFile());
    }

    public void delete(String filename) {
        try {
            Files.delete(load(filename));
        } catch (IOException e) {
            throw new StorageFileNotFoundException("Could not read file: " + filename, e);
        }
    }

    @PostConstruct
    public void init() {
        rootLocation = Paths.get(getDir());
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new StorageException("Could not initialize storage", e);
        }
    }
}