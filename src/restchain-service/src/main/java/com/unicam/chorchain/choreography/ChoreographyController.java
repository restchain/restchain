package com.unicam.chorchain.choreography;

import com.unicam.chorchain.PagedResources;
import com.unicam.chorchain.instance.InstanceService;
import com.unicam.chorchain.storage.FileSystemStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

import static org.springframework.web.bind.annotation.RequestMethod.DELETE;

//import org.camunda.bpm.engine.RuntimeService;


@RequestMapping("/model")
@RestController
@Slf4j
@RequiredArgsConstructor
public class ChoreographyController {

    private final FileSystemStorageService fileSystemStorageService;
    private final ChoreographyService choreographyService;
    private final InstanceService instanceService;

//    @GetMapping
//    public ResponseEntity<?> listUploadedFiles() throws IOException {
//        return ResponseEntity.status(HttpStatus.FOUND).body(fileSystemStorageService.loadAll()
//        );
//    }

//    @GetMapping("{filename:.+}")
//    @ResponseBody
//    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
//
//        Resource file = storageService.loadAsResource(filename);
//        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,
//                "attachment; filename=\"" + file.getFilename() + "\"").body(file);
//    }

    @PostMapping
    public ResponseEntity<?> handleFileUpload(@RequestBody UploadFile uploadFile) {
        log.info("{}", uploadFile);
        uploadFile.setExtension(".bpmn");
        fileSystemStorageService.store(uploadFile);
        log.debug("svg",uploadFile.getSvg());
        choreographyService.create(uploadFile.getName(),
                uploadFile.getDescription(),
                uploadFile.getFilename(),
                uploadFile.getSvg());

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public PagedResources<ChoreographyDTO> listAllModels(Pageable pageable) {
        return choreographyService.findAll(pageable);
    }

    @GetMapping("{id}")
    public ChoreographyDTO read(@PathVariable("id") Long id) {
        return choreographyService.read(id);
    }

    @GetMapping("/xml/{id}")
    public String getXml(@PathVariable("id") Long id) throws IOException {
        return choreographyService.getXml(id);
    }

    @RequestMapping(value = "{id}", method = DELETE)
    public String delete(@PathVariable("id") Long id) {
        ChoreographyDTO choreographyDTO = choreographyService.read(id);
        fileSystemStorageService.delete(choreographyDTO.getName() + ".bpmn");
        return choreographyService.delete(id);
    }
}