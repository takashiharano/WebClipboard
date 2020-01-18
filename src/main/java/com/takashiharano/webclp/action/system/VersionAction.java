package com.takashiharano.webclp.action.system;

import com.takashiharano.util.json.JsonBuilder;
import com.takashiharano.webclp.AppManager;
import com.takashiharano.webclp.ProcessContext;
import com.takashiharano.webclp.action.Action;

public class VersionAction extends Action {

  @Override
  public void process(ProcessContext context) throws Exception {
    String moduleName = AppManager.getModuleName();
    String version = AppManager.getVersionInfo(context);
    JsonBuilder jb = new JsonBuilder();
    jb.add("module", moduleName);
    jb.add("version", version);
    context.sendJsonResponse(jb.toString());
  }

}
